import React, { useState } from "react";
import Modal from "./Modal";
import { FormGroup, FormInput, FormTextarea } from "./Form";
import Button from "./Button";

interface CreatePaketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaketFormData) => Promise<void>;
}

interface PaketFormData {
  kode_paket?: string;
  name: string;
  description: string;
  duration: number; // minutes
}

const CreatePaketModal: React.FC<CreatePaketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<PaketFormData>({
    kode_paket: "",
    name: "",
    description: "",
    duration: 60,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof PaketFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    field: keyof PaketFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PaketFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama paket wajib diisi";
    } else if (formData.name.length < 3) {
      newErrors.name = "Nama paket minimal 3 karakter";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Deskripsi wajib diisi";
    } else if (formData.description.length < 10) {
      newErrors.description = "Deskripsi minimal 10 karakter";
    }
    if (formData.duration <= 0) {
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
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("Error creating paket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      kode_paket: "",
      name: "",
      description: "",
      duration: 60,
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Buat Paket Ujian Baru"
      size="md"
      variant="default"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Buat Paket"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormGroup>
          <FormInput
            label="Kode Paket (opsional)"
            placeholder="Contoh: PKT-001"
            value={formData.kode_paket || ""}
            onChange={(e) => handleInputChange("kode_paket", e.target.value)}
            help="Kosongkan jika ingin otomatis dari sistem"
          />
        </FormGroup>
        <FormGroup>
          <FormInput
            label="Nama Paket"
            placeholder="Contoh: Try Out Komprehensif UKOM"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={errors.name}
            required
          />
        </FormGroup>

        <FormGroup>
          <FormTextarea
            label="Deskripsi"
            placeholder="Paket soal komprehensif"
            value={formData.description}
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
            value={formData.duration}
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

export default CreatePaketModal;
