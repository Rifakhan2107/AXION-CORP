import { db } from '../services/firebase';
import { collection, doc, setDoc, getDocs, writeBatch } from 'firebase/firestore';
import { villages, tankers } from '../data/vidarbhaData';

/**
 * Seed Firestore with Vidarbha village and tanker data
 * Run this once from the admin dashboard to populate the database
 */
export async function seedFirestore() {
    const batch = writeBatch(db);
    const results = { villages: 0, tankers: 0 };

    // Seed villages
    for (const village of villages) {
        const ref = doc(db, 'villages', `village_${village.id}`);
        batch.set(ref, {
            ...village,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        });
        results.villages++;
    }

    // Seed tankers
    for (const tanker of tankers) {
        const ref = doc(db, 'tankers', tanker.id);
        batch.set(ref, {
            ...tanker,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        });
        results.tankers++;
    }

    await batch.commit();
    return results;
}

/**
 * Read villages from Firestore (real-time source)
 * Falls back to local data if Firestore is empty
 */
export async function getVillagesFromFirestore() {
    try {
        const snapshot = await getDocs(collection(db, 'villages'));
        if (snapshot.empty) return null; // fallback to local
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch {
        return null;
    }
}

/**
 * Read tankers from Firestore
 */
export async function getTankersFromFirestore() {
    try {
        const snapshot = await getDocs(collection(db, 'tankers'));
        if (snapshot.empty) return null;
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch {
        return null;
    }
}

/**
 * Update tanker status in Firestore
 */
export async function updateTankerStatus(tankerId, status, lat, lng) {
    try {
        await setDoc(doc(db, 'tankers', tankerId), {
            status,
            lat,
            lng,
            updatedAt: new Date().toISOString(),
        }, { merge: true });
    } catch (err) {
        console.error('Firestore update error:', err);
    }
}

/**
 * Log a trip record
 */
export async function logTrip(tripData) {
    try {
        const tripId = `trip_${Date.now()}`;
        await setDoc(doc(db, 'trips', tripId), {
            ...tripData,
            timestamp: new Date().toISOString(),
            gpsVerified: true,
        });
        return tripId;
    } catch (err) {
        console.error('Trip log error:', err);
        return null;
    }
}
