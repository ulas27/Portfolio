from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler
from qiskit import QuantumCircuit
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager

# Bağlan
service = QiskitRuntimeService(channel="ibm_quantum_platform")
backend = service.backend("ibm_marrakesh")

print(f"✓ Bağlandı: {backend.name}")
print(f"  Qubit: {backend.configuration().n_qubits}")

# Bell state devresi — 2 qubit dolanıklık
qc = QuantumCircuit(2)
qc.h(0)        # Qubit 0'ı süperpozisyona al
qc.cx(0, 1)    # Qubit 1'i dolanık yap
qc.measure_all()

print("\n📐 Devre:")
print(qc.draw(output="text"))

# Gerçek donanım için derle (transpile)
pm = generate_preset_pass_manager(
    optimization_level=1,
    backend=backend
)
compiled = pm.run(qc)

print(f"\n⚙️  Derlendi — derinlik: {compiled.depth()} kapı")

# Gönder
sampler = Sampler(backend)
job = sampler.run([compiled], shots=1024)

print(f"\n🚀 İş gönderildi!")
print(f"   Job ID : {job.job_id()}")
print(f"   Durum  : {job.status()}")
print(f"\n⏳ Sonuç bekleniyor (1-3 dakika)...")

# Bekle ve sonucu al
result = job.result()
counts = result[0].data.meas.get_counts()

print(f"\n✓ SONUÇ GELDİ!")
print(f"  Ölçümler : {counts}")
print(f"\n  00 → {counts.get('00', 0)} kez  ({counts.get('00', 0)/1024*100:.1f}%)")
print(f"  11 → {counts.get('11', 0)} kez  ({counts.get('11', 0)/1024*100:.1f}%)")
print(f"\n  💡 Gerçek kuantum gürültüsü:")
print(f"  01 → {counts.get('01', 0)} kez")
print(f"  10 → {counts.get('10', 0)} kez")
print(f"  (Bunlar hata — gerçek donanımda mükemmel olmaz)")