import time
import datetime
import numpy as np
import pandas as pd
import smtplib
import requests
from email.mime.text import MIMEText
from binance.client import Client

# === Telegram API ===
TELEGRAM_TOKEN = "7885879274:AAGUy8KL83AStRfKC5kH8VLwt3dB6iksJso"
TELEGRAM_CHAT_ID = "838949499"

def send_telegram_message(text):
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        data = {"chat_id": TELEGRAM_CHAT_ID, "text": text}
        response = requests.post(url, data=data)
        print("📤 Telegram gönderildi:", response.status_code)
    except Exception as e:
        print("‼️ Telegram hatası:", e)

# === E-posta ayarları ===
EMAIL_USER = "emreulasinci@gmail.com"
EMAIL_PASS = "pgcadhxdsxuwpjww"
EMAIL_TO = "emreulasinci@gmail.com"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

def send_email(subject: str, body: str):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_USER
    msg["To"] = EMAIL_TO
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)
        server.sendmail(EMAIL_USER, EMAIL_TO, msg.as_string())
        server.quit()
        print("✉️ Email gönderildi.")
    except Exception as e:
        print("‼️ E-posta hatası:", e)

# === STRATEJİ PARAMETRELERİ ===
SYMBOL = "BTCUSDT"
INTERVAL = Client.KLINE_INTERVAL_1MINUTE
CHECK_PERIOD = 5
UPDATE_DELAY = 60

# SHORT
VWAP_THRESH_SHORT = 0.5
ROC_THRESH_SHORT = 1.0
SL_PCT_SHORT = 0.5

# LONG
VWAP_THRESH_LONG = -0.9
ROC_THRESH_LONG = 0.0
SL_PCT_LONG = 0.3

# Binance Client
client = Client()

# Pozisyon durumları
position = None
entry_price = None
entry_time = None
vwap_at_entry = None

def fetch_klines(symbol, interval, lookback_minutes):
    end_time = datetime.datetime.now(datetime.timezone.utc)
    start_time = end_time - datetime.timedelta(minutes=lookback_minutes + 5)
    klines = client.get_klines(symbol=symbol, interval=interval,
                               startTime=int(start_time.timestamp() * 1000),
                               endTime=int(end_time.timestamp() * 1000),
                               limit=lookback_minutes + 10)
    df = pd.DataFrame(klines, columns=["open_time", "open", "high", "low", "close", "volume",
                                       "close_time", "quote_asset_volume", "num_trades",
                                       "taker_buy_base", "taker_buy_quote", "ignore"])
    df = df[["open_time", "open", "high", "low", "close", "volume"]].copy()
    df["open_time"] = pd.to_datetime(df["open_time"], unit="ms", utc=True)
    df[["open", "high", "low", "close", "volume"]] = df[["open", "high", "low", "close", "volume"]].astype(float)
    return df.set_index("open_time")

def compute_vwap(df):
    df = df.copy()
    df["typ_price"] = (df["high"] + df["low"] + df["close"]) / 3
    df["pv"] = df["typ_price"] * df["volume"]
    return df["pv"].cumsum() / df["volume"].cumsum()

def compute_roc(series, periods):
    return series.pct_change(periods=periods) * 100

def main_loop():
    global position, entry_price, entry_time, vwap_at_entry
    print("▶️ Bot çalışıyor...\n")

    while True:
        try:
            df = fetch_klines(SYMBOL, INTERVAL, 180)
            now = datetime.datetime.now(datetime.timezone.utc)
            start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
            df_today = df[df.index >= start_of_day]

            df_today["vwap"] = compute_vwap(df_today)
            df_today["roc_5"] = compute_roc(df_today["close"], periods=CHECK_PERIOD)

            latest = df_today.iloc[-1]
            price = latest["close"]
            vwap = latest["vwap"]
            roc_5 = latest["roc_5"]
            deviation = (price - vwap) / vwap * 100

            if position is None:
                if (deviation > VWAP_THRESH_SHORT) and (roc_5 < ROC_THRESH_SHORT):
                    position = "SHORT"
                    entry_price = price
                    entry_time = latest.name
                    vwap_at_entry = vwap
                    msg = f"🔴 SHORT sinyal: {entry_time.strftime('%Y-%m-%d %H:%M')} UTC\nFiyat: {price:.2f} / VWAP: {vwap:.2f} / ROC(5): {roc_5:.2f}%"
                    send_telegram_message(msg)
                    send_email("🔴 SHORT", msg)

                elif (deviation < VWAP_THRESH_LONG) and (roc_5 > ROC_THRESH_LONG):
                    position = "LONG"
                    entry_price = price
                    entry_time = latest.name
                    vwap_at_entry = vwap
                    msg = f"🟢 LONG sinyal: {entry_time.strftime('%Y-%m-%d %H:%M')} UTC\nFiyat: {price:.2f} / VWAP: {vwap:.2f} / ROC(5): {roc_5:.2f}%"
                    send_telegram_message(msg)
                    send_email("🟢 LONG", msg)

            else:
                sl_price = entry_price * (1 - SL_PCT_LONG / 100) if position == "LONG" else entry_price * (1 + SL_PCT_SHORT / 100)
                tp_price = vwap

                if position == "LONG" and price >= tp_price:
                    pnl = price - entry_price
                    msg = f"✅ LONG TP: +{pnl:.2f} USD"
                    send_telegram_message(msg)
                    send_email("✅ LONG TP", msg)
                    position = None

                elif position == "LONG" and price <= sl_price:
                    pnl = price - entry_price
                    msg = f"⛔ LONG SL: {pnl:.2f} USD"
                    send_telegram_message(msg)
                    send_email("⛔ LONG SL", msg)
                    position = None

                elif position == "SHORT" and price <= tp_price:
                    pnl = entry_price - price
                    msg = f"✅ SHORT TP: +{pnl:.2f} USD"
                    send_telegram_message(msg)
                    send_email("✅ SHORT TP", msg)
                    position = None

                elif position == "SHORT" and price >= sl_price:
                    pnl = entry_price - price
                    msg = f"⛔ SHORT SL: {pnl:.2f} USD"
                    send_telegram_message(msg)
                    send_email("⛔ SHORT SL", msg)
                    position = None

            time.sleep(UPDATE_DELAY)

        except Exception as e:
            print("‼️ Hata:", e)
            time.sleep(15)

if __name__ == "__main__":
    main_loop()
