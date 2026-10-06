'use client';

import { useRef, useState } from 'react';
import { GENRE_TABS } from '@/lib/pose-music/data';
import { FORM_FIELD, SUBMIT_BTN, TR } from './styles';
import type { Artist, Collaborator } from '@/lib/pose-music/types';

export type UploadPayload = {
  title: string;
  genre: string;
  description: string;
  audioFile: File | null;
  coverFile: File | null;
  ownerSplit: number;
  collaborators: Collaborator[];
  totalSplit: number;
};

const UPLOAD_CARD = 'bg-music-card border border-music-hair rounded-music-lg p-[26px] mb-[14px]';
const CARD_HEADING =
  'font-display text-[15.5px] font-bold mb-[18px] flex items-center gap-[9px] text-music-ink [&>i]:text-music-green';
const DROP_ZONE =
  'border-2 border-dashed border-music-hair-bright rounded-music py-[36px] px-[22px] text-center cursor-pointer bg-white/[.01] transition-all duration-[220ms] hover:border-music-green hover:bg-[rgba(29,185,84,.04)]';

const AUDIO_MIME = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/x-flac'];
const MAX_AUDIO_BYTES = 100 * 1024 * 1024;

function FileChip({ file, icon }: { file: File; icon: string }) {
  return (
    <div className="flex items-center gap-[11px] py-[11px] px-[14px] bg-[rgba(29,185,84,.07)] border border-[rgba(29,185,84,.18)] rounded-music-sm mt-[10px] text-[12.5px]">
      <i className={`hgi hgi-stroke hgi-${icon} text-music-green text-[17px]`} />
      <div className="flex-1">
        <p className="font-semibold">{file.name}</p>
        <p className="text-[11.5px] text-music-ink-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
      </div>
      <i className="hgi hgi-stroke hgi-checkmark-circle-02 text-music-green ml-auto" />
    </div>
  );
}

function DropZone({
  label,
  hint,
  icon,
  accept,
  file,
  fileIcon,
  onPick,
}: {
  label: string;
  hint: string;
  icon: string;
  accept: string;
  file: File | null;
  fileIcon: string;
  onPick: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const dropped = event.dataTransfer.files[0];
          if (dropped) onPick(dropped);
        }}
        className={`${DROP_ZONE} ${dragging ? '!border-music-green !bg-[rgba(29,185,84,.04)]' : ''}`}
      >
        <i className={`hgi hgi-stroke hgi-${icon} text-[34px] text-music-ink-muted mb-[10px] block`} />
        <p className="text-[13px] text-music-ink font-semibold">{label}</p>
        <p className="text-[11.5px] text-music-ink-muted mt-[4px]">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            const picked = event.target.files?.[0];
            if (picked) onPick(picked);
          }}
        />
      </div>
      {file ? <FileChip file={file} icon={fileIcon} /> : null}
    </>
  );
}

export function UploadView({
  artist,
  onSubmit,
  onInvalid,
}: {
  artist: Artist;
  onSubmit: (payload: UploadPayload) => Promise<void>;
  onInvalid: (message: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ownerSplit, setOwnerSplit] = useState(100);
  const [collaborators, setCollaborators] = useState<{ name: string; split: number }[]>([]);
  const [busy, setBusy] = useState(false);

  const collaboratorTotal = collaborators.reduce((total, entry) => total + (entry.split || 0), 0);
  const totalSplit = ownerSplit + collaboratorTotal;

  function pickAudio(file: File) {
    if (!AUDIO_MIME.includes(file.type) && !/\.(mp3|wav|flac)$/i.test(file.name)) {
      onInvalid('Please upload MP3, WAV or FLAC');
      return;
    }
    if (file.size > MAX_AUDIO_BYTES) {
      onInvalid('Audio file must be under 100MB');
      return;
    }
    setAudioFile(file);
  }

  function pickCover(file: File) {
    if (!file.type.startsWith('image/')) {
      onInvalid('Please upload an image file');
      return;
    }
    setCoverFile(file);
  }

  function addCollaborator() {
    setCollaborators((prev) => [...prev, { name: '', split: 0 }]);
  }

  function updateCollaborator(index: number, patch: Partial<{ name: string; split: number }>) {
    setCollaborators((prev) => prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  async function submit() {
    setBusy(true);
    try {
      await onSubmit({
        title: title.trim(),
        genre,
        description: description.trim(),
        audioFile,
        coverFile,
        ownerSplit,
        collaborators: [
          { name: artist.name, split: ownerSplit },
          ...collaborators.filter((entry) => entry.name.trim() && entry.split > 0).map((entry) => ({ name: entry.name.trim(), split: entry.split })),
        ],
        totalSplit,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-[680px] mx-auto max-[600px]:px-0">
      <div className="flex items-baseline justify-between mb-[22px]">
        <h2 className="font-display text-[21px] font-bold max-[600px]:text-[17px]">
          <i className="hgi hgi-stroke hgi-upload-01 text-music-green mr-[9px]" />
          Upload New Music
        </h2>
      </div>

      <div className={UPLOAD_CARD}>
        <h3 className={CARD_HEADING}>
          <i className="hgi hgi-stroke hgi-music-note-01" /> Track Information
        </h3>
        <div className="grid grid-cols-2 gap-[14px] max-[600px]:grid-cols-1">
          <label className="flex flex-col gap-[5px] [grid-column:1/-1]">
            <span className="text-[11.5px] font-semibold text-music-ink-soft tracking-[.4px]">Track Title *</span>
            <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter track title" className={FORM_FIELD} />
          </label>
          <label className="flex flex-col gap-[5px]">
            <span className="text-[11.5px] font-semibold text-music-ink-soft tracking-[.4px]">Genre *</span>
            <select value={genre} onChange={(event) => setGenre(event.target.value)} className={`${FORM_FIELD} cursor-pointer`}>
              <option value="" className="music-select-option">Select Genre</option>
              {GENRE_TABS.filter((tab) => tab !== 'All').map((option) => (
                <option key={option} value={option} className="music-select-option">{option}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-[5px]">
            <span className="text-[11.5px] font-semibold text-music-ink-soft tracking-[.4px]">Description</span>
            <input type="text" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Brief description" className={FORM_FIELD} />
          </label>
        </div>
      </div>

      <div className={UPLOAD_CARD}>
        <h3 className={CARD_HEADING}>
          <i className="hgi hgi-stroke hgi-file-audio" /> Upload Files
        </h3>
        <DropZone
          label="Drag & drop your audio file here"
          hint="MP3, WAV, FLAC — Max 100MB"
          icon="cloud-upload"
          accept=".mp3,.wav,.flac"
          file={audioFile}
          fileIcon="file-audio"
          onPick={pickAudio}
        />
        <div className="mt-[14px]">
          <DropZone
            label="Upload cover art"
            hint="PNG, JPG — Min 1000×1000px"
            icon="image-01"
            accept=".png,.jpg,.jpeg"
            file={coverFile}
            fileIcon="image-01"
            onPick={pickCover}
          />
        </div>
      </div>

      <div className={UPLOAD_CARD}>
        <h3 className={CARD_HEADING}>
          <i className="hgi hgi-stroke hgi-user-multiple-02" /> Collaborators &amp; Revenue Split
        </h3>
        <p className="text-music-ink-muted text-[12px] mb-[13px]">
          Add collaborators and specify revenue split. Total must equal 100%.
        </p>

        <div className="flex items-center gap-[9px] p-[9px] bg-music-surface rounded-music-sm mb-[7px]">
          <input
            type="text"
            value={artist.name}
            readOnly
            className="flex-1 bg-music-card border border-music-hair py-[7px] px-[11px] rounded-[6px] text-white font-body text-[12.5px] outline-none opacity-60"
          />
          <input
            type="number"
            min={0}
            max={100}
            value={ownerSplit}
            onChange={(event) => setOwnerSplit(parseInt(event.target.value, 10) || 0)}
            className="w-[65px] bg-music-card border border-music-hair py-[7px] px-[9px] rounded-[6px] text-white font-body text-[12.5px] outline-none text-center"
          />
          <span className="text-[12.5px] text-music-ink-muted">%</span>
        </div>

        {collaborators.map((entry, index) => (
          <div key={index} className="flex items-center gap-[9px] p-[9px] bg-music-surface rounded-music-sm mb-[7px]">
            <input
              type="text"
              placeholder="Collaborator name"
              value={entry.name}
              onChange={(event) => updateCollaborator(index, { name: event.target.value })}
              className="flex-1 bg-music-card border border-music-hair py-[7px] px-[11px] rounded-[6px] text-white font-body text-[12.5px] outline-none focus:border-music-green"
            />
            <input
              type="number"
              placeholder="%"
              min={0}
              max={100}
              value={entry.split}
              onChange={(event) => updateCollaborator(index, { split: parseInt(event.target.value, 10) || 0 })}
              className="w-[65px] bg-music-card border border-music-hair py-[7px] px-[9px] rounded-[6px] text-white font-body text-[12.5px] outline-none text-center"
            />
            <span className="text-[12.5px] text-music-ink-muted">%</span>
            <button
              type="button"
              onClick={() => setCollaborators((prev) => prev.filter((_, i) => i !== index))}
              className={`bg-[rgba(232,65,75,.1)] text-music-red border border-[rgba(232,65,75,.18)] py-[6px] px-[10px] rounded-[6px] cursor-pointer ${TR} hover:bg-[rgba(232,65,75,.2)]`}
            >
              <i className="hgi hgi-stroke hgi-cancel-01" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addCollaborator}
          className={`bg-[rgba(29,185,84,.1)] text-music-green border border-[rgba(29,185,84,.22)] py-[8px] px-[14px] rounded-music-sm cursor-pointer font-body text-[12.5px] font-semibold inline-flex items-center gap-[5px] ${TR} hover:bg-[rgba(29,185,84,.18)]`}
        >
          <i className="hgi hgi-stroke hgi-add-01" /> Add Collaborator
        </button>

        <div className="py-[11px] px-[14px] bg-[rgba(61,139,255,.07)] border border-[rgba(61,139,255,.14)] rounded-music-sm text-[12.5px] mt-[11px]">
          <strong>Total Split:</strong>{' '}
          <span className={totalSplit === 100 ? 'text-music-green' : 'text-music-red'}>{totalSplit}</span>%
        </div>
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={submit}
        className={`${SUBMIT_BTN} w-full py-[13px] mt-[18px]`}
      >
        {busy ? (
          <>
            <i className="hgi hgi-stroke hgi-loading-03 animate-hgi-spin" /> Uploading…
          </>
        ) : (
          <>
            <i className="hgi hgi-stroke hgi-tick-02" /> Upload Track
          </>
        )}
      </button>
    </div>
  );
}
