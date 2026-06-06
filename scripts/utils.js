const AVATAR_COLORS = [
    '#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF',
    '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E',
    '#FC71FF', '#FFC701', '#0038FF', '#FFE62B',
    '#FF4646', '#FFBB2B', '#C3FF2B'
];

function initials(name) {
    return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).join('');
}

function avatarColor(name) {
    let hash = 0;
    for (const ch of name) hash += ch.charCodeAt(0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
