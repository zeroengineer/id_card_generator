import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  Settings, 
  User, 
  RefreshCw, 
  ChevronDown, 
  ShieldCheck, 
  Globe, 
  Mail, 
  MapPin, 
  Phone, 
  FileText 
} from 'lucide-react';
import { toSvg, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

export default function App() {
  // --- Employee State ---
  const [name, setName] = useState('Kiran Krishnakumar Subhashini');
  const [role, setRole] = useState('Chief Executive Officer');
  const [idNumber, setIdNumber] = useState('EMP-0001');
  const [dob, setDob] = useState('01 Jan 1995');
  const [bloodGroup, setBloodGroup] = useState('O +ve');
  const [email, setEmail] = useState('kiran@txtudio.com');
  const [phone, setPhone] = useState('+91 00000 00000');
  
  // --- Company & Notice State (Pre-populated defaults) ---
  const [companyName, setCompanyName] = useState('Coretech Private Limited');
  const [tagline, setTagline] = useState('Building core technology you can trust.');
  const [cin, setCin] = useState('U58200KL2025PTC098222');
  const [registeredOffice, setRegisteredOffice] = useState(
    'First Floor, 69/1016, Manath Kandi Building, PM Kutty Road, East Nadakkave, Kozhikode, Kerala, India – 673006'
  );
  const [website, setWebsite] = useState('txtudio.com');
  const [officeEmail, setOfficeEmail] = useState('contact@snaptiqz.com');
  const [notice, setNotice] = useState(
    'Property of TXTUDIO CORETECH PRIVATE LIMITED. If found, please return to the registered office or contact contact@snaptiqz.com. Unauthorized use is prohibited.'
  );
  
  // --- Image & Utility State ---
  const [photo, setPhoto] = useState('');
  const [logo, setLogo] = useState('');
  const [photoScale, setPhotoScale] = useState(1);
  const [photoX, setPhotoX] = useState(0);
  const [photoY, setPhotoY] = useState(0);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [zoom, setZoom] = useState(0.7); // scale factor for canvas preview
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Refs for download targeting
  const frontCardRef = useRef(null);
  const backCardRef = useRef(null);

  // Dropdown States for Export Action
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // --- Load Default Images and Convert to Base64 ---
  useEffect(() => {
    const convertLocalAssetToBase64 = async (url, setter) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setter(reader.result);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error(`Failed to load default asset: ${url}`, err);
      }
    };

    // Load original default assets from project folders
    convertLocalAssetToBase64('uploads/company logo.png', setLogo);
    convertLocalAssetToBase64('uploads/pasted-1784137543252-0.png', setPhoto);
  }, []);



  // --- Image Upload Handlers ---
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
        triggerNotification('Employee photo updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
        triggerNotification('Company logo updated');
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Notification helper ---
  const triggerNotification = (msg) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // --- Download Helpers ---
  const downloadFile = (dataUrl, filename, extension) => {
    if (extension === 'svg') {
      let svgContent = '';
      if (dataUrl.includes(';base64,')) {
        const base64Part = dataUrl.split(';base64,')[1];
        svgContent = atob(base64Part);
      } else {
        svgContent = decodeURIComponent(dataUrl.split(',')[1]);
      }
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportSvg = async (ref, side) => {
    if (!ref.current) return;
    setIsDownloading(true);
    setDownloadProgress(`Preparing ${side} SVG...`);
    try {
      const dataUrl = await toSvg(ref.current, {
        backgroundColor: '#FAFAF8',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });
      downloadFile(dataUrl, `employee_id_${side}_${idNumber.toLowerCase()}.svg`, 'svg');
      triggerNotification(`${side} SVG downloaded`);
    } catch (err) {
      console.error('Failed to generate SVG', err);
      alert('Error rendering SVG. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const exportJpeg = async (ref, side) => {
    if (!ref.current) return;
    setIsDownloading(true);
    setDownloadProgress(`Generating ${side} JPEG...`);
    try {
      const dataUrl = await toJpeg(ref.current, {
        quality: 0.98,
        pixelRatio: 2, // 2x scaling for crisp printing
        backgroundColor: '#FAFAF8',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });
      downloadFile(dataUrl, `employee_id_${side}_${idNumber.toLowerCase()}.jpeg`, 'jpeg');
      triggerNotification(`${side} JPEG downloaded`);
    } catch (err) {
      console.error('Failed to generate JPEG', err);
      alert('Error rendering JPEG. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const exportDoubleSidedPdf = async () => {
    if (!frontCardRef.current || !backCardRef.current) return;
    setIsDownloading(true);
    setDownloadProgress('Generating high-res pages for PDF...');
    try {
      // Generate crisp 2x scale images
      const frontData = await toJpeg(frontCardRef.current, { quality: 0.98, pixelRatio: 2 });
      setDownloadProgress('Generating Back page...');
      const backData = await toJpeg(backCardRef.current, { quality: 0.98, pixelRatio: 2 });

      setDownloadProgress('Compiling PDF...');
      // Card aspect ratio: 638px x 1011px
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [638, 1011]
      });

      // Add Front
      pdf.addImage(frontData, 'JPEG', 0, 0, 638, 1011);
      
      // Add Back
      pdf.addPage([638, 1011]);
      pdf.addImage(backData, 'JPEG', 0, 0, 638, 1011);

      pdf.save(`employee_id_card_${idNumber.toLowerCase()}.pdf`);
      triggerNotification('Double-sided PDF downloaded');
    } catch (err) {
      console.error('Failed to compile PDF', err);
      alert('Error compilation failed. Please try again.');
    } finally {
      setIsDownloading(false);
      setShowExportDropdown(false);
    }
  };

  const exportSinglePdf = async (ref, side) => {
    if (!ref.current) return;
    setIsDownloading(true);
    setDownloadProgress(`Compiling ${side} PDF...`);
    try {
      const imgData = await toJpeg(ref.current, { quality: 0.98, pixelRatio: 2 });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [638, 1011]
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, 638, 1011);
      pdf.save(`employee_id_${side}_${idNumber.toLowerCase()}.pdf`);
      triggerNotification(`${side} PDF downloaded`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Error rendering PDF.');
    } finally {
      setIsDownloading(false);
    }
  };



  return (
    <div className="app-container">
      {/* --- Sidebar Panel --- */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">ID</div>
          <span className="sidebar-title">Card Generator</span>
        </div>

        <div className="generator-form">
          {/* Section: Employee Data */}
          <div>
            <div className="form-section-title">
              <User size={16} /> Employee Details
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Kiran Krishnakumar Subhashini"
                />
              </div>

              <div className="form-group">
                <label>Designation / Role</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  placeholder="e.g. Chief Executive Officer"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ID Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={idNumber} 
                    onChange={(e) => setIdNumber(e.target.value)} 
                    placeholder="EMP-0001"
                  />
                </div>

                <div className="form-group">
                  <label>Blood Group</label>
                  <select 
                    className="form-input" 
                    value={bloodGroup} 
                    onChange={(e) => setBloodGroup(e.target.value)}
                    style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                  >
                    <option value="A +ve">A +ve</option>
                    <option value="A -ve">A -ve</option>
                    <option value="B +ve">B +ve</option>
                    <option value="B -ve">B -ve</option>
                    <option value="AB +ve">AB +ve</option>
                    <option value="AB -ve">AB -ve</option>
                    <option value="O +ve">O +ve</option>
                    <option value="O -ve">O -ve</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={dob} 
                    onChange={(e) => setDob(e.target.value)} 
                    placeholder="e.g. 01 Jan 1995"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="e.g. +91 00000 00000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="e.g. kiran@txtudio.com"
                />
              </div>

              {/* Photo Upload */}
              <div className="upload-container">
                <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Employee Photo</label>
                {photo ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="image-preview-container">
                      <img src={photo} alt="Preview" className="image-preview-thumbnail" />
                      <div className="image-preview-details">
                        <div className="image-preview-name">Photo Loaded</div>
                        <div className="image-preview-size">Base64 Source</div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          setPhoto('');
                          setPhotoScale(1);
                          setPhotoX(0);
                          setPhotoY(0);
                        }} 
                        className="image-remove-btn"
                        title="Remove image"
                      >
                        &times;
                      </button>
                    </div>

                    {/* Crop / Pan Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Adjust Photo Zoom & Position</div>
                      
                      <div className="form-group" style={{ gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          <span>Zoom</span>
                          <span style={{ fontFamily: 'monospace' }}>{photoScale.toFixed(2)}x</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="3" 
                          step="0.05" 
                          value={photoScale} 
                          onChange={(e) => setPhotoScale(parseFloat(e.target.value))} 
                          style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                        />
                      </div>

                      <div className="form-group" style={{ gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          <span>Move X (Horizontal)</span>
                          <span style={{ fontFamily: 'monospace' }}>{photoX}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="-150" 
                          max="150" 
                          step="1" 
                          value={photoX} 
                          onChange={(e) => setPhotoX(parseInt(e.target.value))} 
                          style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                        />
                      </div>

                      <div className="form-group" style={{ gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          <span>Move Y (Vertical)</span>
                          <span style={{ fontFamily: 'monospace' }}>{photoY}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="-150" 
                          max="150" 
                          step="1" 
                          value={photoY} 
                          onChange={(e) => setPhotoY(parseInt(e.target.value))} 
                          style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPhotoScale(1);
                          setPhotoX(0);
                          setPhotoY(0);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '11px', marginTop: '4px' }}
                      >
                        Reset Adjustment
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="image-dropzone">
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={handlePhotoUpload} 
                    />
                    <div className="dropzone-placeholder">
                      <Upload size={20} />
                      <p>Upload Photo</p>
                      <span>Supports PNG, JPG (Max 5MB)</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Section: Advanced Card customization */}
          <div className="accordion">
            <div 
              className="accordion-header" 
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={16} /> Advanced Card Settings
              </span>
              <ChevronDown 
                size={16} 
                style={{ 
                  transform: isAdvancedOpen ? 'rotate(180deg)' : 'rotate(0)', 
                  transition: 'transform 0.2s' 
                }} 
              />
            </div>
            {isAdvancedOpen && (
              <div className="accordion-content">
                <div className="form-group">
                  <label>Company Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label>Company Logo</label>
                  {logo ? (
                    <div className="image-preview-container" style={{ padding: '8px' }}>
                      <img src={logo} alt="Logo Preview" style={{ height: '30px', objectFit: 'contain' }} />
                      <div className="image-preview-details" style={{ marginLeft: '12px' }}>
                        <div className="image-preview-name" style={{ fontSize: '11px' }}>Logo Image Loaded</div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setLogo('')} 
                        className="image-remove-btn"
                        title="Remove Logo"
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <label className="image-dropzone" style={{ minHeight: '80px', padding: '12px' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={handleLogoUpload} 
                      />
                      <div className="dropzone-placeholder">
                        <Upload size={16} />
                        <span style={{ fontSize: '11px' }}>Upload Company Logo</span>
                      </div>
                    </label>
                  )}
                </div>



                <div className="form-group">
                  <label>Tagline</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={tagline} 
                    onChange={(e) => setTagline(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label>Corporate Identification Number (CIN)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={cin} 
                    onChange={(e) => setCin(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label>Registered Office Address</label>
                  <textarea 
                    className="form-input" 
                    value={registeredOffice} 
                    onChange={(e) => setRegisteredOffice(e.target.value)} 
                    rows="3"
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Website</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={website} 
                      onChange={(e) => setWebsite(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={officeEmail} 
                      onChange={(e) => setOfficeEmail(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notice / Policy</label>
                  <textarea 
                    className="form-input" 
                    value={notice} 
                    onChange={(e) => setNotice(e.target.value)} 
                    rows="4"
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Workspace Canvas Area --- */}
      <div className="workspace">
        <div className="workspace-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>ID Preview Canvas</span>
          </div>

          <div className="workspace-actions">
            {/* Zoom Controls */}
            <div className="zoom-controls" style={{ margin: 0 }}>
              <button 
                type="button" 
                onClick={() => setZoom(Math.max(0.4, zoom - 0.1))} 
                className="zoom-btn"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="zoom-value">{Math.round(zoom * 100)}%</span>
              <button 
                type="button" 
                onClick={() => setZoom(Math.min(1.2, zoom + 0.1))} 
                className="zoom-btn"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            {/* Export Dropdown */}
            <div className="download-dropdown-container">
              <button 
                type="button" 
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="btn btn-primary"
              >
                <Download size={16} /> Export Options <ChevronDown size={14} />
              </button>
              {showExportDropdown && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={exportDoubleSidedPdf}>
                    <FileText size={14} /> Double-Sided PDF
                  </button>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }}></div>
                  <button className="dropdown-item" onClick={() => exportSvg(frontCardRef, 'Front')}>
                    <Download size={14} /> Front Card (SVG)
                  </button>
                  <button className="dropdown-item" onClick={() => exportSvg(backCardRef, 'Back')}>
                    <Download size={14} /> Back Card (SVG)
                  </button>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }}></div>
                  <button className="dropdown-item" onClick={() => exportJpeg(frontCardRef, 'Front')}>
                    <Download size={14} /> Front Card (JPEG)
                  </button>
                  <button className="dropdown-item" onClick={() => exportJpeg(backCardRef, 'Back')}>
                    <Download size={14} /> Back Card (JPEG)
                  </button>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }}></div>
                  <button className="dropdown-item" onClick={() => exportSinglePdf(frontCardRef, 'Front')}>
                    <FileText size={14} /> Front Card (PDF)
                  </button>
                  <button className="dropdown-item" onClick={() => exportSinglePdf(backCardRef, 'Back')}>
                    <FileText size={14} /> Back Card (PDF)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="preview-container" onClick={() => setShowExportDropdown(false)}>
          <div className="preview-grid" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
            
            {/* ============ FRONT CARD PREVIEW (638 × 1011) ============ */}
            <div className="card-preview-wrapper">
              <span className="card-title-tag">Front Side</span>
              <div 
                ref={frontCardRef}
                style={{ 
                  position: 'relative', 
                  width: '638px', 
                  height: '1011px', 
                  background: '#FAFAF8', 
                  borderRadius: '28px', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  boxSizing: 'border-box',
                  fontFamily: "'Space Grotesk', sans-serif" 
                }}
              >


                {/* Logo header */}
                <div style={{ padding: '96px 48px 0 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  {logo ? (
                    <img src={logo} alt="Company Logo" style={{ height: '56px', display: 'block', maxWidth: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#111111', border: '1px dashed #767676', padding: '0 20px', borderRadius: '8px' }}>
                      LOGO PLACEHOLDER
                    </div>
                  )}
                  <div style={{ marginTop: '12px', fontSize: '17px', fontWeight: 600, letterSpacing: '3.5px', color: '#555555', textTransform: 'uppercase' }}>
                    {companyName}
                  </div>
                </div>

                {/* Photo + Meta row */}
                <div style={{ display: 'flex', gap: '28px', padding: '52px 48px 0 48px', alignItems: 'stretch' }}>
                  <div style={{ width: '270px', height: '360px', flexShrink: 0, background: '#EDEDEB', borderRadius: '20px', overflow: 'hidden' }}>
                    {photo ? (
                      <img 
                        src={photo} 
                        alt="Employee Photo" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover', 
                          display: 'block',
                          transform: `scale(${photoScale}) translate(${photoX}px, ${photoY}px)`,
                          transformOrigin: 'center center'
                        }} 
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#767676' }}>
                        No Photo
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '28px' }}>
                    <div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', letterSpacing: '2px', color: '#767676', marginBottom: '7px' }}>ID NUMBER</div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '26px', fontWeight: 700, color: '#111111' }}>{idNumber}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', letterSpacing: '2px', color: '#767676', marginBottom: '7px' }}>DATE OF BIRTH</div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '23px', fontWeight: 700, color: '#111111' }}>{dob}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', letterSpacing: '2px', color: '#767676', marginBottom: '7px' }}>BLOOD GROUP</div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '23px', fontWeight: 700, color: '#111111' }}>{bloodGroup}</div>
                    </div>
                  </div>
                </div>

                {/* Name / Role */}
                <div style={{ padding: '52px 48px 0 48px' }}>
                  <div style={{ fontSize: '44px', fontWeight: 700, color: '#111111', lineHeight: 1.15, textWrap: 'balance', wordBreak: 'break-word' }}>
                    {name}
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '22px', fontWeight: 600, letterSpacing: '2px', color: '#555555', textTransform: 'uppercase' }}>
                    {role}
                  </div>
                </div>

                {/* Dark bottom band with contact */}
                <div style={{ marginTop: 'auto', background: '#111111', padding: '32px 48px 60px 48px', display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: 1.4, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', letterSpacing: '2px', color: '#AFAFAF', marginBottom: '8px' }}>EMAIL</div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 700, color: '#FAFAF8', wordBreak: 'break-all' }}>{email}</div>
                  </div>
                  <div style={{ width: '1px', alignSelf: 'stretch', background: '#3A3A3A', margin: '0 28px' }}></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', letterSpacing: '2px', color: '#AFAFAF', marginBottom: '8px' }}>PHONE</div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 700, color: '#FAFAF8', whiteSpace: 'nowrap' }}>{phone}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ============ BACK CARD PREVIEW (638 × 1011) ============ */}
            <div className="card-preview-wrapper">
              <span className="card-title-tag">Back Side</span>
              <div 
                ref={backCardRef}
                style={{ 
                  position: 'relative', 
                  width: '638px', 
                  height: '1011px', 
                  background: '#FAFAF8', 
                  borderRadius: '28px', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  boxSizing: 'border-box',
                  fontFamily: "'Space Grotesk', sans-serif" 
                }}
              >
                {/* Dark header with Tagline */}
                <div style={{ background: '#111111', padding: '104px 48px 44px 48px' }}>
                  <div style={{ fontSize: '31px', fontWeight: 700, color: '#FAFAF8', lineHeight: 1.3, textWrap: 'balance' }}>
                    {tagline}
                  </div>
                </div>

                {/* Info rows */}
                <div style={{ padding: '16px 48px 0 48px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', padding: '26px 0', borderBottom: '1px solid #E3E3E0' }}>
                    <ShieldCheck size={24} color="#111111" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ width: '130px', flexShrink: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', letterSpacing: '2px', color: '#767676', marginTop: '4px' }}>CIN</div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '17px', fontWeight: 700, color: '#111111', lineHeight: 1.5, wordBreak: 'break-all' }}>{cin}</div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', padding: '26px 0', borderBottom: '1px solid #E3E3E0' }}>
                    <MapPin size={24} color="#111111" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ width: '130px', flexShrink: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', letterSpacing: '2px', color: '#767676', marginTop: '4px' }}>REGISTERED<br />OFFICE</div>
                    <div style={{ fontSize: '18px', color: '#111111', lineHeight: 1.6 }}>{registeredOffice}</div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '26px 0', borderBottom: '1px solid #E3E3E0' }}>
                    <Globe size={24} color="#111111" style={{ flexShrink: 0 }} />
                    <div style={{ width: '130px', flexShrink: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', letterSpacing: '2px', color: '#767676' }}>WEBSITE</div>
                    <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '19px', fontWeight: 600, color: '#111111', textDecoration: 'none' }} onClick={(e) => e.preventDefault()}>
                      {website}
                    </a>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '26px 0', borderBottom: '1px solid #E3E3E0' }}>
                    <Mail size={24} color="#111111" style={{ flexShrink: 0 }} />
                    <div style={{ width: '130px', flexShrink: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', letterSpacing: '2px', color: '#767676' }}>EMAIL</div>
                    <a href={`mailto:${officeEmail}`} style={{ fontSize: '19px', fontWeight: 600, color: '#111111', textDecoration: 'none' }} onClick={(e) => e.preventDefault()}>
                      {officeEmail}
                    </a>
                  </div>
                </div>

                {/* Notice box */}
                <div style={{ margin: '32px 48px 0 48px', background: '#EDEDEB', borderRadius: '20px', padding: '26px 30px' }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', letterSpacing: '2px', color: '#555555', marginBottom: '10px' }}>NOTICE</div>
                  <div style={{ fontSize: '17px', lineHeight: 1.6, color: '#555555' }}>
                    {notice}
                  </div>
                </div>

                {/* Dark footer */}
                <div style={{ marginTop: 'auto', background: '#111111', padding: '34px 48px 56px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  {logo ? (
                    <img src={logo} alt="Company Logo" style={{ height: '38px', display: 'block', filter: 'invert(1)', maxWidth: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#FAFAF8', border: '1px dashed #555555', padding: '0 15px', borderRadius: '4px' }}>
                      LOGO PLACEHOLDER
                    </div>
                  )}
                  <div style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '3px', color: '#9E9E9E', textTransform: 'uppercase' }}>
                    {companyName}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- Notification Banner --- */}
      {showNotification && (
        <div className="notification-banner">
          <Check size={16} /> {notificationMsg}
        </div>
      )}

      {/* --- Loading Overlay --- */}
      {isDownloading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <div className="loading-text">{downloadProgress}</div>
        </div>
      )}
    </div>
  );
}
