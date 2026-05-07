const fs = require('fs');
let code = fs.readFileSync('apps/web/app/superadmin/tutorials/page.tsx', 'utf8');

const target = '                            <option value="">Select a category...</option>';
const injection = `    <div className="modal" id="videoModal" onClick={() => console.log('if(event.target === this) closeModal()')}>
        <div className="modal-content">
            <div className="modal-header">
                <h3 id="modalTitle">Add New Tutorial Video</h3>
                <button className="modal-close" onClick={() => console.log('closeModal()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <form id="videoForm">
                    <input type="hidden" id="videoId" value="" />
                    <div className="form-group">
                        <label><i className="fab fa-youtube"></i> YouTube Video URL</label>
                        <input type="url" className="form-control" id="videoUrl" placeholder="https://www.youtube.com/watch?v=..." />
                        <small style={{"color":"#718096"}}>Supports standard YouTube links</small>
                    </div>
                    <div className="form-group" style={{ textAlign: 'center', margin: '15px 0', position: 'relative' }}>
                        <hr style={{ borderColor: '#edf2f7', position: 'absolute', width: '100%', top: '50%', margin: 0, zIndex: 1 }} />
                        <span style={{ backgroundColor: 'white', padding: '0 15px', color: '#a0aec0', position: 'relative', zIndex: 2, fontSize: '0.85rem' }}>OR</span>
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-upload"></i> Upload from Gallery/Device</label>
                        <input type="file" className="form-control" id="videoUpload" accept="video/*" style={{ padding: '8px' }} />
                        <small style={{"color":"#718096"}}>Select a video file directly from your computer or mobile gallery.</small>
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-heading"></i> Title</label>
                        <input type="text" className="form-control" id="videoTitle" placeholder="e.g., How to Book an Appointment" required />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-align-left"></i> Description</label>
                        <textarea className="form-control" id="videoDescription" rows={3} placeholder="Brief description of this tutorial..."></textarea>
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-tag"></i> Category</label>
                        <select className="form-control" id="videoCategory" required>
` + target;

if(code.includes(target) && !code.includes('id="videoModal"')) {
    code = code.replace(target, injection);
    fs.writeFileSync('apps/web/app/superadmin/tutorials/page.tsx', code);
    console.log('Fixed superadmin tutorials');
} else {
    console.log('Already fixed or target not found');
}
