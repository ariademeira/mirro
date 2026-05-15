import { useState } from 'react'
import { uploadColleaguePhoto } from '../lib/api/colleagues'
import { Avatar } from './ui'

export default function PhotoUpload({ colleagueId = 'new', currentPhotoUrl, onUploadComplete, name }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentPhotoUrl)
  const [error, setError] = useState('')

  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be less than 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)

      const publicUrl = await uploadColleaguePhoto(colleagueId, file)
      onUploadComplete(publicUrl)
    } catch (err) {
      setError(err.message || 'Failed to upload photo')
      setPreview(undefined)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {preview
        ? <img src={preview} alt="photo" className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200" />
        : <Avatar name={name || '?'} size={48} />
      }
      <div className="space-y-1">
        <label>
          <button
            type="button"
            disabled={uploading}
            onClick={() => document.getElementById('photo-upload-input').click()}
            className="btn-secondary text-body-sm"
          >
            {uploading ? 'Uploading…' : preview ? 'Change photo' : 'Upload photo'}
          </button>
          <input
            id="photo-upload-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {error
          ? <p className="text-caption text-danger-600">{error}</p>
          : <p className="text-caption text-slate-400">JPG, PNG or GIF · max 5MB</p>
        }
      </div>
    </div>
  )
}
