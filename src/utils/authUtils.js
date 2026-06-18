export function normalizeUserData(userData) {
  if (!userData || typeof userData !== "object") return userData;

  const stats =
    userData.stats ||
    (userData.classificationCount !== undefined ||
    userData.recommendationCount !== undefined ||
    userData.virtualTryOnCount !== undefined
      ? {
          classification: userData.classificationCount || 0,
          recommendation: userData.recommendationCount || 0,
          virtualTryOn: userData.virtualTryOnCount || 0,
        }
      : undefined);

  return {
    ...userData,
    photo:
      userData.photo ||
      userData.photoUrl ||
      userData.profilePhoto ||
      userData.imageUrl ||
      userData.avatar ||
      null,
    createdAt:
      userData.createdAt ||
      userData.joinedAt ||
      userData.created_at ||
      userData.registeredAt ||
      userData.registrationDate ||
      null,
    stats,
  };
}
