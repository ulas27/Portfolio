# test_setup.py — Kurulum doğrulama

print("=" * 50)
print("KUANTUM AI — KURULUM TESTİ")
print("=" * 50)

# 1. Qiskit testi
try:
    from qiskit import QuantumCircuit
    from qiskit_aer import AerSimulator
    
    # Basit bir Bell state devresi oluştur
    qc = QuantumCircuit(2, 2)
    qc.h(0)        # Hadamard kapısı → süperpozisyon
    qc.cx(0, 1)    # CNOT → dolanıklık (entanglement)
    qc.measure([0, 1], [0, 1])
    
    # Lokal simülatörde çalıştır
    sim = AerSimulator()
    from qiskit.compiler import transpile
    compiled = transpile(qc, sim)
    result = sim.run(compiled, shots=1000).result()
    counts = result.get_counts()
    
    print(f"\n✓ Qiskit OK")
    print(f"  Bell state sonuçları: {counts}")
    print(f"  (00 ve 11 yaklaşık eşit çıkmalı — dolanıklık çalışıyor)")

except Exception as e:
    print(f"\n✗ Qiskit HATA: {e}")

# 2. PennyLane testi
try:
    import pennylane as qml
    import numpy as np
    
    # Lokal simülatör cihaz
    dev = qml.device("default.qubit", wires=2)
    
    @qml.qnode(dev)
    def circuit(theta):
        qml.RY(theta, wires=0)      # Y ekseni etrafında döndür
        qml.CNOT(wires=[0, 1])      # Dolanıklık
        return qml.expval(qml.PauliZ(0))  # Z ölçümü beklenti değeri
    
    theta = np.pi / 4  # 45 derece
    result = circuit(theta)
    
    print(f"\n✓ PennyLane OK")
    print(f"  θ=π/4 için <Z> = {result:.4f}")
    print(f"  (Beklenen: ~0.7071 ≈ cos(π/4))")

except Exception as e:
    print(f"\n✗ PennyLane HATA: {e}")

# 3. PyTorch testi (hibrit model için gerekli)
try:
    import torch
    print(f"\n✓ PyTorch OK — versiyon: {torch.__version__}")
    print(f"  CUDA mevcut: {torch.cuda.is_available()}")
    
except ImportError:
    print(f"\n⚠ PyTorch YOK — kuralım")
    print(f"  Komut: pip install torch --index-url https://download.pytorch.org/whl/cu118")

print("\n" + "=" * 50)
print("Test tamamlandı.")