const TemplateTypes = Object.freeze({
    recover: 'Recover',
    register: 'Register'
});

const MediaTypes = Object.freeze({
    picture: 'picture',
    video: 'video'
});


const GenderTypes = Object.freeze({
    M: 'Male',
    F: 'Female'
});

const ProfileTypes = Object.freeze({
    Admin: 'Admin',
    User: 'User',
    Organizer: 'Organizer'
});

module.exports.TemplateTypes = TemplateTypes;
module.exports.MediaTypes = MediaTypes;
module.exports.ProfileTypes = ProfileTypes;
module.exports.GenderTypes = GenderTypes;