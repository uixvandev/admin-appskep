import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { FormGroup, FormInput, FormTextarea } from "./Form";
import Button from "./Button";
import Alert from "./Alert";

interface PaketData {
  package_code: string;
  name: string;
  description: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

interface EditPaketModalProps {
  isOpen: boolean;
  onClose: () => void;
  paket: PaketData | null;
  onUpdate: (data: Partial<PaketData>) => Promise<void>;
  onDelete: (packageCode: string) => Promise<void>;
}

const EditPaketModal: React.FC<EditPaketModalProps> = ({
  isOpen,
  onClose,
  paket,
  onUpdate,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Partial<PaketData>>({});
  const [errors, setErrors] = useState<
    Partial<
      Record<"name" | "description" | "duration" | "package_code", string>
    >
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Initialize form data when paket changes
  useEffect(() => {
    if (paket) {
      setFormData({
        package_code: paket.package_code,
        name: paket.name,
        description: paket.description,
        duration: paket.duration,
      });
      setErrors({});
      setUpdateSuccess(false);
      setShowDeleteConfirm(false);
    }
  }, [paket]);

  const handleInputChange = (
    field: "name" | "description" | "duration" | "package_code",
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<
      Record<"name" | "description" | "duration", string>
    > = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Nama paket wajib diisi";
    } else if (formData.name.length < 3) {
      newErrors.name = "Nama paket minimal 3 karakter";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Deskripsi wajib diisi";
    } else if (formData.description.length < 10) {
      newErrors.description = "Deskripsi minimal 10 karakter";
    }

    if (formData.duration !== undefined && formData.duration <= 0) {
      newErrors.duration = "Durasi harus lebih dari 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onUpdate(formData);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating paket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!paket) return;

    setIsDeleting(true);

    try {
      await onDelete(paket.package_code);
      handleClose();
    } catch (error) {
      console.error("Error deleting paket:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setErrors({});
    setIsSubmitting(false);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    setUpdateSuccess(false);
    onClose();
  };

  if (!paket) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ubah Paket Ujian"
      size="md"
      variant="default"
      footer={
        <div className="flex gap-3 justify-between w-full">
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSubmitting || isDeleting}
            >
              Hapus Paket
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting || isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting || isDeleting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      }
    >
      {/* Success Alert */}
      {updateSuccess && (
        <Alert
          variant="success"
          title="Berhasil!"
          dismissible
          onDismiss={() => setUpdateSuccess(false)}
        >
          Paket ujian berhasil diperbarui
        </Alert>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Alert variant="danger" title="Konfirmasi Hapus" className="mb-6">
          <div className="space-y-3">
            <p>
              Anda yakin ingin menghapus paket <strong>"{paket.name}"</strong>?
            </p>
            <p className="text-sm text-red-600">
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data
              terkait paket ini.
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                loading={isDeleting}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </Button>
            </div>
          </div>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormGroup>
          <FormInput
            label="Kode Paket (opsional)"
            placeholder="Contoh: PKT-001"
            value={formData.package_code || ""}
            onChange={(e) => handleInputChange("package_code", e.target.value)}
            help="Gunakan kode paket yang unik, contoh: PKT-KLINIK-01"
          />
        </FormGroup>
        <FormGroup>
          <FormInput
            label="Nama Paket"
            placeholder="Contoh: Try Out Komprehensif UKOM"
            value={formData.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={errors.name}
            required
          />
        </FormGroup>

        <FormGroup>
          <FormTextarea
            label="Deskripsi"
            placeholder="Paket soal komprehensif"
            value={formData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            error={errors.description}
            required
            rows={4}
          />
        </FormGroup>

        <FormGroup>
          <FormInput
            label="Durasi (menit)"
            type="number"
            min={1}
            placeholder="120"
            value={formData.duration ?? 60}
            onChange={(e) =>
              handleInputChange("duration", Number(e.target.value))
            }
            error={errors.duration}
            required
            help="Masukkan durasi ujian dalam satuan menit"
          />
        </FormGroup>
      </form>
    </Modal>
  );
};

export default EditPaketModal;
