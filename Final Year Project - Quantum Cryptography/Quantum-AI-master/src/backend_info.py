from qiskit_ibm_runtime import QiskitRuntimeService

service = QiskitRuntimeService(channel="ibm_quantum_platform")

print("=" * 60)
print("IBM QUANTUM SİSTEM BİLGİLERİ")
print("=" * 60)

for name in ["ibm_marrakesh", "ibm_kingston", "ibm_fez"]:
    b = service.backend(name)
    config = b.configuration()
    status = b.status()
    
    print(f"\n• {name}")
    print(f"  Qubit sayısı  : {config.n_qubits}")
    print(f"  Kuyruk        : {status.pending_jobs} iş bekliyor")
    print(f"  Durum         : {'✓ Aktif' if status.operational else '✗ Kapalı'}")
