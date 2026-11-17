"use client";

import { Formik, Form, ErrorMessage, FormikHelpers } from "formik";
import { ReusableInput } from "@/components/reusable-input";
import { Button } from "@/components/ui/button";
import FormSelect from "@/components/react-select";
import useData from "@/hooks/use-data";
import { useState } from "react";
import { validationSchema } from "@/schemas/post-schema";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createPost } from "@/services/post-service";
export interface FormValues {
  eventId: { value: string } | null;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  images: File[];
  videos?: File[];
  link: string;
}

const CreatePost = () => {
  const { events } = useData("events");
  const [isMultipleImages, setIsMultipleImages] = useState(true);
  const navigate = useRouter();

  const eventsOptions = events.map((event) => ({
    value: String(event.id),
    label: `${event.title}`,
  }));

  const initialValues: FormValues = {
    eventId: null,
    title: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    images: [],
    videos: [],
    link: "",
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    const formData = new FormData();
    if (values.eventId?.value) {
      formData.append("eventId", values.eventId.value);
    }
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("category", values.category);
    formData.append("startDate", values.startDate);
    formData.append("endDate", values.endDate);
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
      await createPost(formData);
      toast.success("La noticia se ha creado con éxito");
      resetForm();
      navigate.push("/panel/noticias");
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
        <Form className="p-4 rounded-xl shadow-lg bg-white border space-y-4">
          <div className="space-y-4">
            <div className="w-full">
              <label
                htmlFor="event"
                className="block text-sm font-medium mb-1 text-gray-700"
              >
                Evento
              </label>
              <FormSelect
                name="eventId"
                options={eventsOptions}
                placeH="Selecciona un evento"
                isMultiSelect={false}
              />
              <ErrorMessage
                name="eventId"
                className="text-red-500 text-sm mt-1"
                component="div"
              />
            </div>

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
              classN="h-16 w-full"
            />

            <ReusableInput
              label="Enlace (Opcional)"
              name="link"
              placeholder="Ingresa una URL"
            />

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

export default CreatePost;
