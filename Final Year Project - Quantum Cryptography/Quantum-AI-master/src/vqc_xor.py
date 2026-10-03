import pennylane as qml
from pennylane import numpy as np
import matplotlib.pyplot as plt

print("=" * 55)
print("VQC — XOR ÖĞRENİCİ")
print("=" * 55)

# ── 1. VERİ ──────────────────────────────────────────────
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float, requires_grad=False)
Y = np.array([-1, 1, 1, -1], dtype=float, requires_grad=False)

# ── 2. CİHAZ ─────────────────────────────────────────────
dev = qml.device("default.qubit", wires=2)

# ── 3. DEVREYİ TASARLA ───────────────────────────────────
@qml.qnode(dev, interface="autograd")
def vqc(inputs, weights):
    qml.RY(inputs[0] * np.pi, wires=0)
    qml.RY(inputs[1] * np.pi, wires=1)
    qml.RY(weights[0, 0], wires=0)
    qml.RY(weights[0, 1], wires=1)
    qml.CNOT(wires=[0, 1])
    qml.RY(weights[1, 0], wires=0)
    qml.RY(weights[1, 1], wires=1)
    qml.CNOT(wires=[1, 0])
    return qml.expval(qml.PauliZ(0))

# ── 4. LOSS ───────────────────────────────────────────────
def loss(weights):
    preds = np.stack([vqc(X[i], weights) for i in range(4)])
    return np.mean((preds - Y) ** 2)

# ── 5. EĞİTİM ────────────────────────────────────────────
np.random.seed(42)
weights = np.array(
    np.random.uniform(-np.pi, np.pi, size=(2, 2)),
    requires_grad=True
)

learning_rate = 0.3
epochs        = 80
loss_history  = []

print(f"\nBaşlangıç ağırlıkları:\n{weights.round(3)}")
print(f"\nEğitim başlıyor — {epochs} epoch\n")

opt = qml.GradientDescentOptimizer(stepsize=learning_rate)

for epoch in range(epochs):
    weights, current_loss = opt.step_and_cost(loss, weights)
    loss_history.append(float(current_loss))

    if epoch % 10 == 0:
        preds = np.stack([vqc(X[i], weights) for i in range(4)])
        acc   = np.mean(np.sign(preds) == Y) * 100
        print(f"  Epoch {epoch:3d} | Loss: {float(current_loss):.4f} | Doğruluk: %{acc:.0f}")

# ── 6. SONUÇ ─────────────────────────────────────────────
print("\n" + "=" * 55)
print("EĞİTİM TAMAMLANDI")
print("=" * 55)

preds = [vqc(X[i], weights) for i in range(4)]
print(f"\n{'Girdi':<12} {'Beklenen':>10} {'Tahmin':>10} {'Doğru?':>8}")
print("-" * 44)
for i in range(4):
    p     = float(preds[i])
    y     = float(Y[i])
    label = "✓" if np.sign(p) == y else "✗"
    print(f"  {str(X[i].tolist()):<10} {y:>10.0f} {p:>10.4f}   {label}")

final_acc = np.mean(np.sign(preds) == Y) * 100
print(f"\nSon doğruluk: %{float(final_acc):.0f}")

# ── 7. GRAFİK ────────────────────────────────────────────
plt.figure(figsize=(8, 4))
plt.plot(loss_history, color="royalblue", linewidth=2)
plt.title("VQC — XOR Eğitim Loss Grafiği")
plt.xlabel("Epoch")
plt.ylabel("MSE Loss")
plt.grid(alpha=0.3)
plt.tight_layout()
plt.savefig("results/vqc_xor_loss.png")
print(f"\nGrafik kaydedildi → results/vqc_xor_loss.png")