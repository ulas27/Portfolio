from qiskit_ibm_runtime import QiskitRuntimeService

API_TOKEN = "_URst15NknvOOG8alzLEYyHDOcerSWdkc3bfJ0wvv3ZC"  # quantum.ibm.com'dan kopyala

QiskitRuntimeService.save_account(
    channel="ibm_quantum_platform",
    token=API_TOKEN,
    overwrite=True
)

service = QiskitRuntimeService(channel="ibm_quantum_platform")

backends = service.backends()

print("\n✓ IBM Quantum bağlantısı başarılı!")
print(f"\nKullanılabilir sistemler ({len(backends)} adet):")
for b in backends:
    print(f"  • {b.name}")