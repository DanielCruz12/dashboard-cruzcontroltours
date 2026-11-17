import * as Yup from "yup";

export const validationSchema = Yup.object({
  eventId: Yup.object().required("Debe seleccionar un evento"),
  title: Yup.string().required("El título es obligatorio"),
  description: Yup.string().required("La descripción es obligatoria"),
  category: Yup.string().required("La categoría es obligatoria"),
  startDate: Yup.date().required("La fecha de inicio es obligatoria"),
  endDate: Yup.date()
    .required("La fecha de finalización es obligatoria")
    .min(
      Yup.ref("startDate"),
      "La fecha de finalización debe ser posterior a la fecha de inicio"
    ),
  images: Yup.mixed()
    .required("Se requiere al menos una imagen")
    .test("fileType", "Solo se permiten imágenes", (value) => {
      if (!value) return false;
      const files = Array.isArray(value) ? value : [value];
      return files.every((file) =>
        ["image/jpeg", "image/png"].includes(file.type)
      );
    }),
  videos: Yup.mixed()
    .nullable()
    .test("fileType", "Solo se permiten videos MP4", (value) => {
      if (!value) return true; // Opcional
      const files = Array.isArray(value) ? value : [value];
      return files.every((file) => file.type === "video/mp4");
    }),

  link: Yup.string(),
});
