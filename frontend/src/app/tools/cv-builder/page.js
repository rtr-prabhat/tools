'use client';
import { useState, useCallback } from 'react';

const SECTIONS = ['Personal Info', 'Summary', 'Experience', 'Education', 'Skills', 'Certifications'];

const ACTION_VERBS = ['led','managed','developed','improved','increased','reduced','built','created','delivered','achieved','spearheaded','coordinated','implemented','designed','launched'];

function calcATS(personalInfo, summary, experience, education, skills, certifications) {
  let score = 0;
  if (personalInfo.name) score += 5;
  if (personalInfo.email) score += 5;
  if (personalInfo.phone) score += 5;
  if (personalInfo.location) score += 5;
  if (summary.length > 50) score += 10;
  if (summary.match(/\d+/)) score += 5;
  if (experience.length > 0) score += 10;
  if (experience.some(e => e.description.match(/\d+/))) score += 10;
  if (experience.some(e => ACTION_VERBS.some(v => e.description.toLowerCase().includes(v)))) score += 10;
  if (education.length > 0) score += 10;
  if (skills.length >= 5) score += 10;
  if (skills.length >= 10) score += 5;
  if (certifications.length > 0) score += 5;
  if (personalInfo.linkedin) score += 5;
  return Math.min(score, 100);
}

function ATSBadge({ score }) {
  const color = score < 50 ? '#ef4444' : score < 75 ? '#f59e0b' : score < 90 ? '#22c55e' : '#6366f1';
  const label = score < 50 ? 'Weak' : score < 75 ? 'Fair' : score < 90 ? 'Good' : 'Excellent';
  const pct = score;
  const r = 28, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <svg width={72} height={72} viewBox="0 0 72 72">
        <circle cx={36} cy={36} r={r} fill="none" stroke="#e2e8f0" strokeWidth={7} />
        <circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 36 36)" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
        <text x={36} y={40} textAnchor="middle" fontSize={15} fontWeight="700" fill={color}>{score}</text>
      </svg>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color }}>ATS Score: {label}</div>
        <div style={{ fontSize: 11, color: '#64748b' }}>out of 100</div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text', required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 12px',
          fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s' }}
        onFocus={e => e.target.style.borderColor = '#6366f1'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
    </div>
  );
}

function SectionPersonal({ data, onChange }) {
  const f = (k) => (v) => onChange({ ...data, [k]: v });
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <InputField label="Full Name" value={data.name} onChange={f('name')} placeholder="John Doe" required />
        <InputField label="Job Title" value={data.jobTitle} onChange={f('jobTitle')} placeholder="Software Engineer" />
        <InputField label="Email" value={data.email} onChange={f('email')} placeholder="john@example.com" type="email" />
        <InputField label="Phone" value={data.phone} onChange={f('phone')} placeholder="+91 98765 43210" />
        <InputField label="Location" value={data.location} onChange={f('location')} placeholder="Mumbai, India" />
        <InputField label="LinkedIn URL" value={data.linkedin} onChange={f('linkedin')} placeholder="linkedin.com/in/johndoe" />
        <div style={{ gridColumn: '1/-1' }}>
          <InputField label="Portfolio / Website" value={data.website} onChange={f('website')} placeholder="https://johndoe.dev" />
        </div>
      </div>
    </div>
  );
}

function SectionSummary({ value, onChange }) {
  return (
    <div>
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#1d4ed8' }}>
        💡 Tip: Include your years of experience, key skills, and a quantifiable achievement. Aim for 3–5 sentences.
      </div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Professional Summary</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={6} placeholder="Results-driven software engineer with 5+ years of experience building scalable web applications. Led a team of 6 developers to deliver a product used by 100K+ users..."
        style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 14,
          color: '#1e293b', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
        onFocus={e => e.target.style.borderColor = '#6366f1'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
      <div style={{ textAlign: 'right', fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{value.length} characters</div>
    </div>
  );
}

function SectionExperience({ items, onChange }) {
  const add = () => onChange([...items, { id: Date.now(), company: '', title: '', startDate: '', endDate: '', present: false, location: '', description: '' }]);
  const remove = (id) => onChange(items.filter(x => x.id !== id));
  const update = (id, k, v) => onChange(items.map(x => x.id === id ? { ...x, [k]: v } : x));
  const move = (idx, dir) => {
    const arr = [...items];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    onChange(arr);
  };
  return (
    <div>
      {items.map((exp, idx) => (
        <div key={exp.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 16, background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Experience {idx + 1}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => move(idx, -1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}>↑</button>
              <button onClick={() => move(idx, 1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}>↓</button>
              <button onClick={() => remove(exp.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#dc2626', fontSize: 12, fontWeight: 600 }}>✕</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <InputField label="Job Title" value={exp.title} onChange={v => update(exp.id, 'title', v)} placeholder="Senior Engineer" />
            <InputField label="Company" value={exp.company} onChange={v => update(exp.id, 'company', v)} placeholder="Acme Corp" />
            <InputField label="Start Date" value={exp.startDate} onChange={v => update(exp.id, 'startDate', v)} placeholder="Jan 2022" />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>End Date</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="text" value={exp.endDate} onChange={e => update(exp.id, 'endDate', e.target.value)}
                  placeholder="Dec 2023" disabled={exp.present}
                  style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#1e293b', outline: 'none', opacity: exp.present ? 0.5 : 1 }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={exp.present} onChange={e => update(exp.id, 'present', e.target.checked)} /> Present
                </label>
              </div>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <InputField label="Location" value={exp.location} onChange={v => update(exp.id, 'location', v)} placeholder="Mumbai, India" />
            </div>
          </div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Description</label>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Use action verbs. Add numbers for impact (e.g., "Increased revenue by 30%")</div>
          <textarea value={exp.description} onChange={e => update(exp.id, 'description', e.target.value)} rows={4}
            placeholder="• Developed and maintained 3 microservices handling 1M+ daily requests&#10;• Led a team of 5 engineers to deliver the project 2 weeks ahead of schedule"
            style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13,
              color: '#1e293b', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'monospace' }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
        </div>
      ))}
      <button onClick={add} style={{ width: '100%', border: '2px dashed #c7d2fe', background: '#eef2ff', borderRadius: 12,
        padding: '12px', color: '#6366f1', fontWeight: 600, cursor: 'pointer', fontSize: 14, transition: 'all 0.2s' }}>
        + Add Work Experience
      </button>
    </div>
  );
}

function SectionEducation({ items, onChange }) {
  const add = () => onChange([...items, { id: Date.now(), degree: '', field: '', institution: '', year: '', grade: '' }]);
  const remove = (id) => onChange(items.filter(x => x.id !== id));
  const update = (id, k, v) => onChange(items.map(x => x.id === id ? { ...x, [k]: v } : x));
  return (
    <div>
      {items.map((edu, idx) => (
        <div key={edu.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 16, background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Education {idx + 1}</span>
            <button onClick={() => remove(edu.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#dc2626', fontSize: 12, fontWeight: 600 }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <InputField label="Degree" value={edu.degree} onChange={v => update(edu.id, 'degree', v)} placeholder="B.Tech / B.Sc / MBA" />
            <InputField label="Field of Study" value={edu.field} onChange={v => update(edu.id, 'field', v)} placeholder="Computer Science" />
            <InputField label="Institution" value={edu.institution} onChange={v => update(edu.id, 'institution', v)} placeholder="IIT Bombay" />
            <InputField label="Year" value={edu.year} onChange={v => update(edu.id, 'year', v)} placeholder="2020" />
            <div style={{ gridColumn: '1/-1' }}>
              <InputField label="Grade / GPA (optional)" value={edu.grade} onChange={v => update(edu.id, 'grade', v)} placeholder="8.5 CGPA / First Class" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={add} style={{ width: '100%', border: '2px dashed #c7d2fe', background: '#eef2ff', borderRadius: 12,
        padding: '12px', color: '#6366f1', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
        + Add Education
      </button>
    </div>
  );
}

function SectionSkills({ skills, setSkills, skillInput, setSkillInput, jobTitle }) {
  const suggested = jobTitle.toLowerCase().includes('engineer') || jobTitle.toLowerCase().includes('developer')
    ? ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'REST APIs', 'Docker']
    : jobTitle.toLowerCase().includes('design')
    ? ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'UI/UX', 'Wireframing', 'Prototyping']
    : ['Communication', 'Leadership', 'Project Management', 'MS Office', 'Problem Solving', 'Teamwork'];

  const addSkill = (s) => {
    const trimmed = s.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed]);
    setSkillInput('');
  };
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput); }
    if (e.key === 'Backspace' && !skillInput && skills.length > 0) setSkills(skills.slice(0, -1));
  };
  const remove = (s) => setSkills(skills.filter(x => x !== s));
  return (
    <div>
      <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '8px 12px', minHeight: 52,
        display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 12 }}>
        {skills.map(s => (
          <span key={s} style={{ background: '#eef2ff', color: '#4f46e5', borderRadius: 20, padding: '3px 10px', fontSize: 13,
            fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            {s}
            <button onClick={() => remove(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
          </span>
        ))}
        <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleKey}
          placeholder={skills.length === 0 ? 'Type skill + Enter...' : ''}
          style={{ border: 'none', outline: 'none', fontSize: 14, minWidth: 120, flex: 1, color: '#1e293b' }} />
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>Press Enter or comma to add. {skills.length} skills added.</div>
      {suggested.length > 0 && (
        <div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Suggested:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {suggested.filter(s => !skills.includes(s)).map(s => (
              <button key={s} onClick={() => addSkill(s)}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20, padding: '3px 10px',
                  fontSize: 12, color: '#64748b', cursor: 'pointer', transition: 'all 0.15s' }}>
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionCertifications({ items, onChange }) {
  const add = () => onChange([...items, { id: Date.now(), name: '', issuer: '', year: '' }]);
  const remove = (id) => onChange(items.filter(x => x.id !== id));
  const update = (id, k, v) => onChange(items.map(x => x.id === id ? { ...x, [k]: v } : x));
  return (
    <div>
      {items.map((cert, idx) => (
        <div key={cert.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 12, background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Certification {idx + 1}</span>
            <button onClick={() => remove(cert.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#dc2626', fontSize: 12, fontWeight: 600 }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 12px' }}>
            <InputField label="Certification Name" value={cert.name} onChange={v => update(cert.id, 'name', v)} placeholder="AWS Solutions Architect" />
            <InputField label="Issuing Organization" value={cert.issuer} onChange={v => update(cert.id, 'issuer', v)} placeholder="Amazon Web Services" />
            <InputField label="Year" value={cert.year} onChange={v => update(cert.id, 'year', v)} placeholder="2023" />
          </div>
        </div>
      ))}
      <button onClick={add} style={{ width: '100%', border: '2px dashed #c7d2fe', background: '#eef2ff', borderRadius: 12,
        padding: '12px', color: '#6366f1', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
        + Add Certification
      </button>
    </div>
  );
}

function CVPreview({ personalInfo, summary, experience, education, skills, certifications }) {
  const s = {
    page: { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 11, color: '#1a1a2e', lineHeight: 1.5, padding: '32px 36px', maxWidth: 680, margin: '0 auto', background: '#fff', minHeight: 900 },
    name: { fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 2, fontFamily: 'Arial, sans-serif' },
    jobTitle: { fontSize: 13, color: '#6366f1', fontWeight: 600, marginBottom: 6, fontFamily: 'Arial, sans-serif' },
    divider: { borderTop: '2.5px solid #4f46e5', marginBottom: 12, marginTop: 4 },
    contact: { fontSize: 10.5, color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginBottom: 14 },
    sectionHeader: { fontSize: 10, fontFamily: 'Arial, sans-serif', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4f46e5', borderBottom: '1px solid #c7d2fe', paddingBottom: 3, marginTop: 18, marginBottom: 8 },
    expTitle: { fontSize: 12, fontWeight: 700, color: '#1e293b', fontFamily: 'Arial, sans-serif' },
    expMeta: { fontSize: 10.5, color: '#64748b', marginBottom: 4 },
    desc: { fontSize: 11, color: '#334155', whiteSpace: 'pre-line' },
    skillPill: { display: 'inline-block', background: '#eef2ff', color: '#4338ca', padding: '2px 8px', borderRadius: 10, fontSize: 10, margin: '2px 3px' },
  };
  const hasContent = personalInfo.name || personalInfo.email;
  if (!hasContent) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center', minHeight: 400 }}>
      <div>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Your CV preview will appear here</div>
        <div style={{ fontSize: 12, marginTop: 6 }}>Start filling in your details on the left</div>
      </div>
    </div>
  );
  return (
    <div id="cv-preview" style={s.page}>
      {personalInfo.name && <div style={s.name}>{personalInfo.name}</div>}
      {personalInfo.jobTitle && <div style={s.jobTitle}>{personalInfo.jobTitle}</div>}
      <div style={s.divider} />
      <div style={s.contact}>
        {personalInfo.email && <span>✉ {personalInfo.email}</span>}
        {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
        {personalInfo.location && <span>📍 {personalInfo.location}</span>}
        {personalInfo.linkedin && <span>🔗 {personalInfo.linkedin}</span>}
        {personalInfo.website && <span>🌐 {personalInfo.website}</span>}
      </div>

      {summary && (
        <>
          <div style={s.sectionHeader}>Professional Summary</div>
          <p style={{ ...s.desc, marginTop: 0, marginBottom: 0 }}>{summary}</p>
        </>
      )}

      {experience.length > 0 && (
        <>
          <div style={s.sectionHeader}>Work Experience</div>
          {experience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={s.expTitle}>{exp.title}{exp.title && exp.company ? ' – ' : ''}{exp.company}</div>
                <div style={{ fontSize: 10.5, color: '#64748b', whiteSpace: 'nowrap', marginLeft: 8 }}>
                  {exp.startDate}{exp.startDate && (exp.endDate || exp.present) ? ' – ' : ''}{exp.present ? 'Present' : exp.endDate}
                </div>
              </div>
              {exp.location && <div style={s.expMeta}>📍 {exp.location}</div>}
              {exp.description && <div style={s.desc}>{exp.description}</div>}
            </div>
          ))}
        </>
      )}

      {education.length > 0 && (
        <>
          <div style={s.sectionHeader}>Education</div>
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={s.expTitle}>{edu.degree}{edu.degree && edu.field ? ', ' : ''}{edu.field}</div>
                <div style={{ fontSize: 10.5, color: '#64748b' }}>{edu.year}</div>
              </div>
              <div style={s.expMeta}>{edu.institution}{edu.grade ? ` — ${edu.grade}` : ''}</div>
            </div>
          ))}
        </>
      )}

      {skills.length > 0 && (
        <>
          <div style={s.sectionHeader}>Skills</div>
          <div style={{ marginTop: 4 }}>
            {skills.map(s2 => <span key={s2} style={s.skillPill}>{s2}</span>)}
          </div>
        </>
      )}

      {certifications.length > 0 && (
        <>
          <div style={s.sectionHeader}>Certifications</div>
          {certifications.map((cert) => (
            <div key={cert.id} style={{ marginBottom: 6 }}>
              <span style={s.expTitle}>{cert.name}</span>
              {cert.issuer && <span style={{ fontSize: 10.5, color: '#64748b' }}> — {cert.issuer}</span>}
              {cert.year && <span style={{ fontSize: 10.5, color: '#64748b' }}> ({cert.year})</span>}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default function CVBuilder() {
  const [activeSection, setActiveSection] = useState(0);
  const [personalInfo, setPersonalInfo] = useState({ name: '', email: '', phone: '', location: '', linkedin: '', website: '', jobTitle: '' });
  const [summary, setSummary] = useState('');
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const atsScore = calcATS(personalInfo, summary, experience, education, skills, certifications);

  const handleDownload = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const handleCopyText = useCallback(() => {
    const lines = [];
    if (personalInfo.name) lines.push(personalInfo.name.toUpperCase());
    if (personalInfo.jobTitle) lines.push(personalInfo.jobTitle);
    const contacts = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean);
    if (contacts.length) lines.push(contacts.join(' | '));
    if (personalInfo.linkedin) lines.push(personalInfo.linkedin);
    lines.push('');
    if (summary) { lines.push('PROFESSIONAL SUMMARY'); lines.push('-'.repeat(30)); lines.push(summary); lines.push(''); }
    if (experience.length) {
      lines.push('WORK EXPERIENCE'); lines.push('-'.repeat(30));
      experience.forEach(e => {
        lines.push(`${e.title} — ${e.company}`);
        lines.push(`${e.startDate} – ${e.present ? 'Present' : e.endDate}${e.location ? ` | ${e.location}` : ''}`);
        if (e.description) lines.push(e.description);
        lines.push('');
      });
    }
    if (education.length) {
      lines.push('EDUCATION'); lines.push('-'.repeat(30));
      education.forEach(e => { lines.push(`${e.degree} in ${e.field} — ${e.institution} (${e.year})${e.grade ? ` | ${e.grade}` : ''}`); });
      lines.push('');
    }
    if (skills.length) { lines.push('SKILLS'); lines.push(skills.join(', ')); lines.push(''); }
    if (certifications.length) {
      lines.push('CERTIFICATIONS');
      certifications.forEach(c => lines.push(`${c.name} — ${c.issuer} (${c.year})`));
    }
    navigator.clipboard.writeText(lines.join('\n')).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }, [personalInfo, summary, experience, education, skills, certifications]);

  const renderSection = () => {
    switch (activeSection) {
      case 0: return <SectionPersonal data={personalInfo} onChange={setPersonalInfo} />;
      case 1: return <SectionSummary value={summary} onChange={setSummary} />;
      case 2: return <SectionExperience items={experience} onChange={setExperience} />;
      case 3: return <SectionEducation items={education} onChange={setEducation} />;
      case 4: return <SectionSkills skills={skills} setSkills={setSkills} skillInput={skillInput} setSkillInput={setSkillInput} jobTitle={personalInfo.jobTitle} />;
      case 5: return <SectionCertifications items={certifications} onChange={setCertifications} />;
      default: return null;
    }
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #cv-preview, #cv-preview * { visibility: visible !important; }
          #cv-preview { position: fixed !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          @page { margin: 0.5in; size: A4; }
        }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)', padding: '24px 16px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0 }}>📄 ATS Resume Builder</h1>
            <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>Build a professional, ATS-optimized resume. No sign-up required.</p>
          </div>

          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {/* Left Panel */}
            <div style={{ flex: 1, minWidth: 0, background: '#fff', borderRadius: 20, boxShadow: '0 2px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {/* ATS Score Header */}
              <div style={{ background: 'linear-gradient(135deg, #f8fafc, #eef2ff)', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ATSBadge score={atsScore} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleDownload} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    ⬇ Download PDF
                  </button>
                  <button onClick={handleCopyText} style={{ background: copied ? '#22c55e' : '#f1f5f9', color: copied ? '#fff' : '#475569', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                    {copied ? '✓ Copied!' : '📋 Copy Text'}
                  </button>
                  <button onClick={() => setShowMobilePreview(!showMobilePreview)}
                    style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'none' }}
                    className="mobile-preview-toggle">
                    👁 Preview
                  </button>
                </div>
              </div>

              {/* Section Tabs */}
              <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #e2e8f0', padding: '0 4px' }}>
                {SECTIONS.map((sec, idx) => (
                  <button key={idx} onClick={() => setActiveSection(idx)}
                    style={{ padding: '10px 14px', fontSize: 12, fontWeight: activeSection === idx ? 700 : 500,
                      color: activeSection === idx ? '#4f46e5' : '#64748b', background: 'none', border: 'none',
                      borderBottom: activeSection === idx ? '2px solid #4f46e5' : '2px solid transparent',
                      cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                    {idx + 1}. {sec}
                  </button>
                ))}
              </div>

              {/* Section Content */}
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>{SECTIONS[activeSection]}</div>
                {renderSection()}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                  {activeSection > 0 && (
                    <button onClick={() => setActiveSection(activeSection - 1)}
                      style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      ← Previous
                    </button>
                  )}
                  <div style={{ flex: 1 }} />
                  {activeSection < SECTIONS.length - 1 && (
                    <button onClick={() => setActiveSection(activeSection + 1)}
                      style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Next →
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Preview Panel */}
            <div style={{ width: 480, flexShrink: 0, position: 'sticky', top: 16 }}>
              <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', overflow: 'auto', maxHeight: '90vh' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 13, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  👁 Live Preview
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400, marginLeft: 'auto' }}>Updates as you type</span>
                </div>
                <CVPreview personalInfo={personalInfo} summary={summary} experience={experience} education={education} skills={skills} certifications={certifications} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
