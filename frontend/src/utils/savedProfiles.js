const getStorageKey = (userId) => `savedProfiles:${userId || "guest"}`;

export const getSavedProfiles = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(userId)) || "[]");
  } catch {
    return [];
  }
};

export const saveProfile = (userId, profile) => {
  const profiles = getSavedProfiles(userId).filter((saved) => saved.id !== profile.id);
  const nextProfiles = [profile, ...profiles];
  localStorage.setItem(getStorageKey(userId), JSON.stringify(nextProfiles));
  return nextProfiles;
};

export const removeSavedProfile = (userId, profileId) => {
  const nextProfiles = getSavedProfiles(userId).filter((profile) => profile.id !== profileId);
  localStorage.setItem(getStorageKey(userId), JSON.stringify(nextProfiles));
  return nextProfiles;
};

export const isProfileSaved = (userId, profileId) =>
  getSavedProfiles(userId).some((profile) => profile.id === profileId);
