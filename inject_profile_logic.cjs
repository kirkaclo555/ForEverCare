const fs = require('fs');
const path = require('path');

// 1. Update TopBar.tsx
function updateTopBar() {
    const topBarPath = path.join(__dirname, 'apps', 'web', 'components', 'TopBar.tsx');
    let content = fs.readFileSync(topBarPath, 'utf8');

    // Add profilePic state and event listener
    const stateHook = `
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    // Load initial profile pic
    const loadProfilePic = () => {
      const pic = localStorage.getItem('adminProfilePic');
      if (pic) setProfilePic(pic);
    };
    loadProfilePic();

    // Listen for updates from other components
    window.addEventListener('profilePicUpdated', loadProfilePic);
    return () => window.removeEventListener('profilePicUpdated', loadProfilePic);
  }, []);
`;
    // Insert after "const [darkMode, setDarkMode] = useState(false);"
    content = content.replace(/const \[darkMode, setDarkMode\] = useState\(false\);/, `const [darkMode, setDarkMode] = useState(false);\n${stateHook}`);

    // Make user profile clickable and render image
    const userProfileHTML = `
        {/* User Profile */}
        <div className="user-profile" onClick={() => router.push(pathname.includes('superadmin') ? '/superadmin/profile' : '/admin/profile')} style={{ cursor: 'pointer' }}>
          <div className="avatar" style={{ overflow: 'hidden' }}>
            {profilePic ? (
                <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <span>A</span>
            )}
          </div>
`;
    content = content.replace(/{\/\* User Profile \*\/}\s*<div className="user-profile">[\s\S]*?<div className="avatar">[\s\S]*?<span>A<\/span>\s*<\/div>/, userProfileHTML);

    fs.writeFileSync(topBarPath, content, 'utf8');
}

// 2. Update admin/profile/page.tsx
function updateProfilePage() {
    const profilePath = path.join(__dirname, 'apps', 'web', 'app', 'superadmin', 'profile', 'page.tsx');
    let content = fs.readFileSync(profilePath, 'utf8');

    // Add states and file reader logic
    const stateLogic = `
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  React.useEffect(() => {
    const pic = localStorage.getItem('adminProfilePic');
    if (pic) setProfilePic(pic);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePic(base64String);
        localStorage.setItem('adminProfilePic', base64String);
        window.dispatchEvent(new Event('profilePicUpdated'));
      };
      reader.readAsDataURL(file);
    }
  };
`;
    content = content.replace(/const router = useRouter\(\);\s*return \(\s*<>/, `const router = useRouter();\n${stateLogic}\n  return (\n    <>`);

    // Update profile-header-content avatar display
    const avatarHeader = `
                    <div className="profile-avatar-large" onClick={() => setIsEditModalOpen(true)} style={{ cursor: 'pointer', overflow: 'hidden' }}>
                        {profilePic ? (
                            <img id="profileAvatarImage" src={profilePic} alt="Profile Picture" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span className="avatar-text" id="profileAvatarText">AD</span>
                        )}
                    </div>
`;
    content = content.replace(/<div className="profile-avatar-large" onClick=\{\(\) => console\.log\('openEditModal\(\)'\)\}>[\s\S]*?<\/div>/, avatarHeader);

    // Update "Edit Profile" button
    content = content.replace(/<button className="edit-profile-btn" onClick=\{\(\) => console\.log\('openEditModal\(\)'\)\}>/, '<button className="edit-profile-btn" onClick={() => setIsEditModalOpen(true)}>');

    // Update Edit Modal logic
    const editModalHtml = `
    <div className="modal" style={{ display: isEditModalOpen ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }} onClick={(e) => { if (e.target === e.currentTarget) setIsEditModalOpen(false); }}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h2>Edit Profile</h2>
                <button className="close-modal" onClick={() => setIsEditModalOpen(false)}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
            <div className="modal-body">
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control" defaultValue="Admin User" placeholder="Enter your full name" />
                </div>
                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" defaultValue="admin@furcare.com" placeholder="Enter your email" />
                </div>
                <div className="form-group">
                    <label className="form-label">Contact Number</label>
                    <input type="tel" className="form-control" defaultValue="+1 (555) 123-4567" placeholder="Enter your phone number" />
                </div>
                <div className="form-group">
                    <label className="form-label">Address</label>
                    <input type="text" className="form-control" defaultValue="123 Main Street, Springfield, IL 62701" placeholder="Enter your address" />
                </div>
                <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-control" placeholder="Tell us about yourself">Experienced veterinary clinic administrator with over 5 years of experience in managing daily operations, patient records, and staff coordination. Passionate about providing the best care for animals and supporting our team of dedicated veterinarians.</textarea>
                </div>
                <div className="form-group">
                    <label className="form-label">Profile Picture</label>
                    <input type="file" className="form-control" accept="image/*" onChange={handleImageUpload} />
                </div>
            </div>
            <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => setIsEditModalOpen(false)}>Save Changes</button>
            </div>
        </div>
    </div>
`;
    // Replace the old edit modal
    content = content.replace(/<div className="modal" id="editModal"[\s\S]*?<div className="modal" id="generalSettingsModal"/, editModalHtml + '\n    <div className="modal" id="generalSettingsModal"');

    fs.writeFileSync(profilePath, content, 'utf8');
}

updateTopBar();
updateProfilePage();
console.log('Profile sync complete.');
