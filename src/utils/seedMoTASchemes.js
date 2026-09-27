import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../Firebase";
import { SCHEME_CONFIGS } from "../data/schemesData";

/**
 * Checks if official MoTA schemes exist in Firestore, and seeds them if missing.
 * @param {string} userId - Current user's UID (or system UID)
 * @returns {Promise<{ seeded: boolean, count: number }>}
 */
export const seedOfficialMoTASchemes = async (userId = "system_mota_admin") => {
  try {
    const scholarshipsRef = collection(db, "scholarships");
    const snapshot = await getDocs(scholarshipsRef);
    const existing = snapshot.docs.map((d) => d.data());

    let count = 0;

    for (const [key, config] of Object.entries(SCHEME_CONFIGS)) {
      // Check if scheme with same schemeType or name already exists
      const alreadyExists = existing.some(
        (s) => s.schemeType === key || s.name === config.name
      );

      if (!alreadyExists) {
        const newDocRef = doc(scholarshipsRef);
        await setDoc(newDocRef, {
          name: config.name,
          schemeType: key,
          shortName: config.shortName,
          description: config.description,
          implementedBy: config.implementedBy,
          portal: config.portal,
          incomeLimit: config.eligibility.incomeLimit,
          ageLimit: config.eligibility.ageLimit?.max || config.eligibility.ageLimit?.phd?.max || 36,
          minimumMarks: config.eligibility.minimumMarks || 55,
          courseLevels: config.eligibility.courseLevels || [],
          totalSlots: config.slots?.total || null,
          pvtgSlots: config.slots?.pvtg || null,
          femaleSlots: config.slots?.female || null,
          requiredDocuments: config.requiredDocuments,
          renewalRequired: config.renewalRequired || false,
          eligibility: `${config.description} Category: ST. Income ceiling: ${config.eligibility.incomeLimitLabel}.`,
          awardSummary:
            key === "NFST"
              ? "JRF: ₹37,000/mo (first 2 yrs), SRF: ₹42,000/mo (next 3 yrs). Contingency: ₹10,000-₹25,000/yr. HRA & escort allowance as per norms."
              : key === "NOS"
              ? "100% Tuition. Maintenance: USD 15,400/yr (USA) / GBP 9,900/yr (UK). Airfare, visa & insurance covered."
              : "100% Tuition for Govt institutions, ₹2.5L/yr for Private. Living: ₹3,000/mo. Books: ₹5,000/yr. Computer grant: ₹45,000 (one-time).",
          createdBy: userId,
          createdAt: new Date().toISOString(),
          isOfficialMoTA: true,
        });
        count++;
      }
    }

    return { seeded: count > 0, count };
  } catch (err) {
    console.error("Error seeding MoTA schemes:", err);
    throw err;
  }
};
