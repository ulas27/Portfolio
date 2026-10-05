import requests
import os
from flask import current_app

def send_whatsapp_message(ticket_number, name, email, phone, subject, message):
    """WhatsApp mesajı gönder"""
    try:
        # WhatsApp Business API URL (örnek)
        whatsapp_api_url = current_app.config.get('WHATSAPP_API_URL', 'https://api.whatsapp.com/send')
        business_phone = current_app.config.get('WHATSAPP_BUSINESS_PHONE', '+905468992717')
        
        # Mesaj içeriği
        whatsapp_message = f"""
🎫 *Yeni Destek Talebi*

📋 *Ticket No:* {ticket_number}
👤 *Ad Soyad:* {name}
📧 *Email:* {email}
📞 *Telefon:* {phone or 'Belirtilmemiş'}
📝 *Konu:* {subject}
💬 *Mesaj:*
{message}

---
Bu mesaj otomatik olarak gönderilmiştir.
        """.strip()
        
        # WhatsApp URL oluştur
        whatsapp_url = f"{whatsapp_api_url}?phone={business_phone}&text={whatsapp_message}"
        
        # Gerçek WhatsApp entegrasyonu için API çağrısı yapılabilir
        # Şimdilik URL döndürüyoruz
        return {
            'success': True,
            'url': whatsapp_url,
            'message': 'WhatsApp mesajı hazırlandı'
        }
        
    except Exception as e:
        current_app.logger.error(f"WhatsApp mesaj hatası: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def get_whatsapp_contact_url():
    """WhatsApp iletişim URL'i"""
    business_phone = current_app.config.get('WHATSAPP_BUSINESS_PHONE', '+905468992717')
    return f"https://wa.me/{business_phone.replace('+', '').replace(' ', '')}"
