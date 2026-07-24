import { ref } from "vue";

const isOpen = ref(false);
const prefilledCourseCode = ref("");

export function useUploadModal() {
  function open(courseCode: string = "") {
    prefilledCourseCode.value = courseCode;
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  return {
    isOpen,
    prefilledCourseCode,
    open,
    close,
  };
}
