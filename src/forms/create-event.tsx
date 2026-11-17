"use client";

import toast from "react-hot-toast";
import { useState } from "react";
import { Formik, Form, FormikHelpers, ErrorMessage } from "formik";
import { ReusableInput } from "@/components/reusable-input";
import { Button } from "@/components/ui/button";
import { validationSchema } from "@/schemas/event-schema"; // Updated import path
import { createEvent } from "@/services/event-service";
import FormSelect from "@/components/react-select";
import { useRouter } from "next/navigation";
export interface FormValues {
  title: string;
  description: string;
  organizer: string;
  category: string;
  startDate: string;
  endDate: string;
  images: File[];
  videos?: File[];
  link: string;
  eventType: { value: string; label: string };
}

const CreateEvent = () => {
  const [isMultipleImages, setIsMultipleImages] = useState(true);
  const navigate = useRouter();

  const eventTypeOptions = [
    { value: "banner", label: "Banner" },
    { value: "upcoming_event", label: "Evento Próximo" },
    { value: "all", label: "Todos" },
  ];

  const initialValues: FormValues = {
    title: "",
    description: "",
    organizer: "",
    category: "",
    startDate: "",
    endDate: "",
    images: [],
    videos: [],
    link: "",
    eventType: { value: "upcoming_event", label: "Evento Próximo" },
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    const formData = new FormData();

    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("organizer", values.organizer);
    formData.append("category", values.category);
    formData.append("startDate", values.startDate);
    formData.append("endDate", values.endDate);
    formData.append("eventType", values.eventType.value);
    if (values.link) {
      formData.append("youtubeLinks", values.link);
    }

    if (values.images) {
      const images = Array.isArray(values.images)
        ? values.images
        : [values.images];
      images.forEach((image) => formData.append("imgs", image));
    }

    if (values.videos && values.videos.length > 0) {
      values.videos.forEach((video) => formData.append("videos", video));
    }
    try {
      await createEvent(formData);
      toast.success("Evento creado con éxito");
      resetForm();
      navigate.push("/panel/eventos");
    } catch (error) {
      console.error("Error enviando el formulario:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue, touched, errors, isSubmitting }) => (
        <Form className="p-4 px-10 rounded-xl space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <ReusableInput
                label="Título"
                name="title"
                placeholder="Ingresa el título"
              />
              <ReusableInput
                label="Categoría"
                name="category"
                placeholder="Ingresa la categoría"
              />
            </div>

            <div className="w-full">
              <label
                htmlFor="eventType"
                className="block text-sm font-medium mb-1 text-gray-700"
              >
                Tipo de evento
              </label>
              <FormSelect
                name="eventType"
                options={eventTypeOptions}
                placeH="Selecciona un tipo de evento"
                isMultiSelect={false}
              />
              <ErrorMessage
                name="eventType"
                className="text-red-500 text-sm mt-1"
                component="div"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ReusableInput
                label="Fecha de inicio"
                name="startDate"
                placeholder="Ingresa la fecha de inicio"
                typeInput="date"
              />
              <ReusableInput
                label="Fecha de finalización"
                name="endDate"
                placeholder="Ingresa la fecha de finalización"
                typeInput="date"
              />
            </div>

            <ReusableInput
              label="Descripción"
              name="description"
              placeholder="Ingresa la descripción"
              typeInput="textarea"
            />

            <div className="grid md:grid-cols-2 gap-3">
              <ReusableInput
                label="Organizador"
                name="organizer"
                placeholder="Ingrese el organizador"
              />

              <ReusableInput
                label="Enlace (Opcional)"
                name="link"
                placeholder="Ingresa una URL"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isMultipleImages}
                  onChange={(e) => setIsMultipleImages(e.target.checked)}
                  className="form-checkbox"
                />
                <span>Permitir múltiples imágenes</span>
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="images"
                  className="block text-sm font-medium mb-1 text-gray-700"
                >
                  Imágenes
                </label>
                <input
                  id="images"
                  name="images"
                  type="file"
                  accept="image/*"
                  multiple={isMultipleImages}
                  onChange={(event) => {
                    const files = event.target.files;
                    setFieldValue(
                      "images",
                      isMultipleImages ? Array.from(files || []) : files?.[0]
                    );
                  }}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {errors.images && touched.images && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.images as string}
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="videos"
                  className="block text-sm font-medium mb-1 text-gray-700"
                >
                  Videos
                </label>
                <input
                  id="videos"
                  name="videos"
                  type="file"
                  accept="video/mp4"
                  multiple
                  onChange={(event) => {
                    const files = event.target.files;
                    setFieldValue("videos", Array.from(files || []));
                  }}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={isSubmitting} className="px-6">
              {isSubmitting ? "Enviando..." : "Crear Noticia"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CreateEvent;
