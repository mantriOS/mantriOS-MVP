
"""Convert canonical MantriOS petitions into deterministic sequential text."""

from typing import Any


# Fixed ordering is important for consistent embedding generation.
FIELD_ORDER = (
    ("issue", "Issue"),
    ("petition_summary", "Petition Summary"),
    ("applicant_context", "Applicant Context"),
    ("facts", "Facts"),
    ("entities_involved", "Entities Involved"),
    ("requested_actions", "Requested Actions"),
    ("procedural_history", "Procedural History"),
    ("important_dates", "Important Dates"),
    ("amounts_and_financial_details", "Amounts and Financial Details"),
    ("reference_numbers", "Reference Numbers"),
    ("relevant_documents", "Relevant Documents"),
    ("department_context", "Department Context"),
    ("unresolved_issues", "Unresolved Issues"),
    ("uncertainties_and_contradictions", "Uncertainties and Contradictions"),
    ("missing_information", "Missing Information"),
)


def _format_value(value: Any) -> str:
    """Format a canonical value deterministically without discarding details."""

    if value is None:
        return ""

    if isinstance(value, str):
        return " ".join(value.split())

    if isinstance(value, bool):
        return "Yes" if value else "No"

    if isinstance(value, (int, float)):
        return str(value)

    if isinstance(value, list):
        items = [_format_value(item) for item in value]
        return "\n".join(
            f"- {item}" for item in items if item
        )

    if isinstance(value, dict):
        # Sort nested keys so equivalent dictionaries produce stable text.
        parts = []
        for key in sorted(value.keys(), key=str):
            formatted = _format_value(value[key])
            if formatted:
                parts.append(f"{key}: {formatted}")
        return "; ".join(parts)

    raise TypeError(
        f"Unsupported canonical value type: {type(value).__name__}"
    )


def canonical_petition_to_text(canonical: dict[str, Any]) -> str:
    """
    Convert a canonical petition object into stable sequential text.

    Args:
        canonical: The inner canonical_petition dictionary returned
                   by canonicalize_petition(), not its outer response.

    Returns:
        A labeled text representation suitable for embedding.

    Raises:
        TypeError: If the input is not a dictionary.
        ValueError: If no usable petition content is present.
    """
    if not isinstance(canonical, dict):
        raise TypeError("canonical must be a dictionary")

    sections = []

    for field_name, label in FIELD_ORDER:
        if field_name not in canonical:
            continue

        formatted = _format_value(canonical[field_name])

        # Skip null, empty strings, and empty lists.
        if not formatted:
            continue

        sections.append(f"{label}:\n{formatted}")

    if not sections:
        raise ValueError("Canonical petition contains no usable content")

    return "\n\n".join(sections)
