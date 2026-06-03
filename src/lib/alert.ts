import Swal from "sweetalert2";


export const successAlert = (
  title: string,
  text?: string,
) => {
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

export const errorAlert = (
  title: string,
  text?: string,
) => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#dc2626",
    background: "#ffffff",
    color: "#111827",
  });
};

export const warningAlert = (
  title: string,
  text?: string,
) => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonColor: "#ea580c",
    background: "#ffffff",
    color: "#111827",
  });
};

export const confirmAlert = (
  title: string,
  text?: string,
) => {
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