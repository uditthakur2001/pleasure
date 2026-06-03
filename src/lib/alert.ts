// import Swal from "sweetalert2";
const getSwal = async () => {
  const module = await import("sweetalert2");
  return module.default;
};

export const successAlert = async (
  title: string,
  text?: string,
) => {
  const Swal = await getSwal();

  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: "#0f766e",
    background: "#ffffff",
    color: "#111827",
    timer: 1800,
    showConfirmButton: false,
  });
};

export const errorAlert = async (
  title: string,
  text?: string,
) => {
  const Swal = await getSwal();

  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#dc2626",
    background: "#ffffff",
    color: "#111827",
  });
};

export const warningAlert = async (
  title: string,
  text?: string,
) => {
  const Swal = await getSwal();

  return Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonColor: "#ea580c",
    background: "#ffffff",
    color: "#111827",
  });
};

export const confirmAlert = async (
  title: string,
  text?: string,
) => {
  const Swal = await getSwal();

  return Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: "#0f766e",
    cancelButtonColor: "#dc2626",
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
    background: "#ffffff",
    color: "#111827",
  });
};