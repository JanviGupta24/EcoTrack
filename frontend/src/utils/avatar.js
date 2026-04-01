// src/utils/avatar.js
export const getAvatarUrl = (user) => {
  if (!user) {
    return `https://ui-avatars.com/api/?name=User&background=10b981&color=fff&size=256&bold=true`;
  }

  // If backend gives absolute URL
  if (user.avatar && /^https?:\/\//i.test(user.avatar)) {
    return user.avatar;
  }

  // If backend gives relative path (uploads/avatar.jpg)
  if (user.avatar) {
    const apiBase = (
      process.env.REACT_APP_API_URL || window.location.origin
    ).replace(/\/$/, "");
    const avatarPath = user.avatar.replace(/^\//, "");
    return `${apiBase}/${avatarPath}`;
  }

  // No avatar → generate initials (First + Last)
  const name = (user.name || "User").trim();
  const parts = name.split(" ");
  let initials = parts[0].charAt(0);
  if (parts.length > 1) initials += parts[parts.length - 1].charAt(0);
  initials = initials.toUpperCase();

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials
  )}&background=10b981&color=fff&size=256&bold=true`;
};
