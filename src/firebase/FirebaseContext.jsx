import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../Firebase"; // Auth instance
import { db } from "../Firebase"; // Firestore instance

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import { getCurrentUser } from "./auth";

const FirebaseContext = createContext();

export const useFirebase = () => {
  return useContext(FirebaseContext);
};

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const createUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(currentUser);
      setUser(currentUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const createScholarship = async (scholarshipData) => {
    const user = getCurrentUser();
    if (user) {
      const newScholarshipRef = doc(collection(db, "scholarships"));
      await setDoc(newScholarshipRef, {
        ...scholarshipData,
        createdBy: user.uid,
        modifiedBy: user.uid,
        createdAt: new Date(),
        modifiedAt: new Date(),
      });
    } else {
      throw new Error("User not authenticated");
    }
  };

  const updateScholarship = async (scholarshipId, updatedData) => {
    const user = getCurrentUser();
    if (user) {
      const scholarshipRef = doc(db, "scholarships", scholarshipId);
      const scholarshipSnap = await getDoc(scholarshipRef);
      if (
        scholarshipSnap.exists() &&
        scholarshipSnap.data().createdBy === user.uid
      ) {
        await updateDoc(scholarshipRef, {
          ...updatedData,
          modifiedBy: user.uid,
          modifiedAt: new Date(),
        });
      } else {
        throw new Error("Unauthorized to modify this scholarship");
      }
    } else {
      throw new Error("User not authenticated");
    }
  };

  const deleteScholarship = async (scholarshipId) => {
    const user = getCurrentUser();
    if (user) {
      const scholarshipRef = doc(db, "scholarships", scholarshipId);
      const scholarshipSnap = await getDoc(scholarshipRef);
      if (
        scholarshipSnap.exists() &&
        scholarshipSnap.data().createdBy === user.uid
      ) {
        await deleteDoc(scholarshipRef); // Delete the scholarship
      } else {
        throw new Error("Unauthorized to delete this scholarship");
      }
    } else {
      throw new Error("User not authenticated");
    }
  };

  const fetchScholarships = async () => {
    const scholarships = [];
    const querySnapshot = await getDocs(collection(db, "scholarships"));
    querySnapshot.forEach((doc) => {
      scholarships.push({ id: doc.id, ...doc.data() });
    });
    return scholarships;
  };

  return (
    <FirebaseContext.Provider
      value={{
        createScholarship,
        updateScholarship,
        fetchScholarships,
        deleteScholarship,
        createUser,
        user,
        userData,
        logout,
        signIn,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};
