
import unittest

from app.services.petition_text import canonical_petition_to_text


class CanonicalPetitionTextTests(unittest.TestCase):
    def setUp(self):
        self.canonical = {
            "issue": "  Delay in certificate issuance ",
            "petition_summary": "Student reports a delay.",
            "applicant_context": None,
            "facts": [
                "Course completed in 2025.",
                "Certificate is still pending.",
            ],
            "entities_involved": ["University", "Student"],
            "requested_actions": ["Issue the certificate."],
            "procedural_history": [],
            "important_dates": ["Course completed in 2025"],
            "amounts_and_financial_details": [],
            "reference_numbers": [],
            "relevant_documents": [],
            "department_context": "University administration",
            "unresolved_issues": ["Reason for delay"],
            "uncertainties_and_contradictions": [],
            "missing_information": ["Application reference number"],
        }

    def test_fields_are_in_fixed_order(self):
        text = canonical_petition_to_text(self.canonical)

        self.assertLess(
            text.index("Issue:"),
            text.index("Petition Summary:"),
        )
        self.assertLess(
            text.index("Petition Summary:"),
            text.index("Facts:"),
        )
        self.assertLess(
            text.index("Facts:"),
            text.index("Requested Actions:"),
        )

    def test_empty_fields_are_omitted(self):
        text = canonical_petition_to_text(self.canonical)

        self.assertNotIn("Applicant Context:", text)
        self.assertNotIn("Procedural History:", text)
        self.assertNotIn("Reference Numbers:", text)

    def test_list_items_are_preserved(self):
        text = canonical_petition_to_text(self.canonical)

        self.assertIn("- Course completed in 2025.", text)
        self.assertIn("- Certificate is still pending.", text)
        self.assertIn("- Issue the certificate.", text)

    def test_conversion_is_deterministic(self):
        first = canonical_petition_to_text(self.canonical)
        second = canonical_petition_to_text(self.canonical)

        self.assertEqual(first, second)

    def test_rejects_empty_petition(self):
        with self.assertRaises(ValueError):
            canonical_petition_to_text({})


if __name__ == "__main__":
    unittest.main()
