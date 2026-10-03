from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Optional

from qiskit import QuantumCircuit, transpile
from qiskit_aer import Aer


@dataclass(frozen=True)
class GroverResult:
    n_qubits: int
    target: str
    iterations: int
    shots: int
    target_probability: float
    counts: dict[str, int]

def _oracle_mark_target(target: str) -> QuantumCircuit:
    """Phase-flip oracle for a computational basis target (small n).

    Implemented by mapping the target state to |11..1>, applying a multi-controlled Z,
    then uncomputing the mapping.
    """
    n = len(target)
    if n < 2:
        raise ValueError("n must be >= 2")

    qc = QuantumCircuit(n)
    for i, bit in enumerate(target):
        if bit == "0":
            qc.x(i)

    qc.h(n - 1)
    qc.mcx(list(range(n - 1)), n - 1)
    qc.h(n - 1)

    for i, bit in enumerate(target):
        if bit == "0":
            qc.x(i)

    return qc


def _diffusion(n: int) -> QuantumCircuit:
    qc = QuantumCircuit(n)
    qc.h(range(n))
    qc.x(range(n))
    qc.h(n - 1)
    qc.mcx(list(range(n - 1)), n - 1)
    qc.h(n - 1)
    qc.x(range(n))
    qc.h(range(n))
    return qc


def _oracle_mark_target_2q(target: Literal["00", "01", "10", "11"]) -> QuantumCircuit:
    """Phase-flip oracle for 2-qubit computational basis target."""
    qc = QuantumCircuit(2)

    # Map the target to |11>, apply CZ, then uncompute mapping.
    if target[0] == "0":
        qc.x(0)
    if target[1] == "0":
        qc.x(1)

    qc.cz(0, 1)

    if target[0] == "0":
        qc.x(0)
    if target[1] == "0":
        qc.x(1)

    return qc


def _diffusion_2q() -> QuantumCircuit:
    qc = QuantumCircuit(2)
    qc.h([0, 1])
    qc.x([0, 1])
    qc.h(1)
    qc.cx(0, 1)
    qc.h(1)
    qc.x([0, 1])
    qc.h([0, 1])
    return qc


def run_grover_2q(
    *,
    target: Literal["00", "01", "10", "11"] = "11",
    iterations: int = 1,
    shots: int = 1024,
    seed_simulator: Optional[int] = 1234,
) -> GroverResult:
    """2-qubit Grover search demo with a single marked state."""
    if iterations < 0:
        raise ValueError("iterations must be non-negative")
    if shots <= 0:
        raise ValueError("shots must be positive")

    qc = QuantumCircuit(2, 2)
    qc.h([0, 1])

    oracle = _oracle_mark_target_2q(target)
    diffusion = _diffusion_2q()
    for _ in range(iterations):
        qc.compose(oracle, inplace=True)
        qc.compose(diffusion, inplace=True)

    qc.measure([0, 1], [0, 1])

    backend = Aer.get_backend("aer_simulator")
    tqc = transpile(qc, backend)
    result = backend.run(tqc, shots=shots, seed_simulator=seed_simulator).result()
    counts = result.get_counts()

    target_count = counts.get(target, 0)
    return GroverResult(
        n_qubits=2,
        target=target,
        iterations=iterations,
        shots=shots,
        target_probability=target_count / shots,
        counts=counts,
    )


def run_grover(
    *,
    target: str,
    iterations: int,
    shots: int = 1024,
    seed_simulator: Optional[int] = 1234,
) -> GroverResult:
    """Grover search for 2..4 qubits with one marked state."""
    if iterations < 0:
        raise ValueError("iterations must be non-negative")
    if shots <= 0:
        raise ValueError("shots must be positive")
    if not target or any(c not in "01" for c in target):
        raise ValueError("target must be a non-empty bitstring")

    n = len(target)
    if n == 2 and target in {"00", "01", "10", "11"}:
        return run_grover_2q(
            target=target,  # type: ignore[arg-type]
            iterations=iterations,
            shots=shots,
            seed_simulator=seed_simulator,
        )
    if n < 2 or n > 4:
        raise ValueError("this demo supports 2..4 qubits")

    qc = QuantumCircuit(n, n)
    qc.h(range(n))

    oracle = _oracle_mark_target(target)
    diff = _diffusion(n)
    for _ in range(iterations):
        qc.compose(oracle, inplace=True)
        qc.compose(diff, inplace=True)

    qc.measure(range(n), range(n))

    backend = Aer.get_backend("aer_simulator")
    tqc = transpile(qc, backend)
    result = backend.run(tqc, shots=shots, seed_simulator=seed_simulator).result()
    counts = result.get_counts()

    target_count = counts.get(target, 0)
    return GroverResult(
        n_qubits=n,
        target=target,
        iterations=iterations,
        shots=shots,
        target_probability=target_count / shots,
        counts=counts,
    )
