import { useDropZone } from "@vueuse/core";
import type { Ref } from "vue";
import type { ChatInputApi } from "@/composables/useChatPanel";

const EXTENSION_BY_MEDIA_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function normalizeClipboardFile(file: File, index: number): File {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension && extension !== file.name.toLowerCase()) return file;

  const resolvedExtension = EXTENSION_BY_MEDIA_TYPE[file.type];
  if (!resolvedExtension) return file;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return new File(
    [file],
    `skarmbild-${timestamp}${index ? `-${index + 1}` : ""}.${resolvedExtension}`,
    { type: file.type, lastModified: Date.now() },
  );
}

export function useChatAttachmentSurface(
  input: Ref<ChatInputApi | null>,
  enabled: Ref<boolean>,
) {
  const dropZoneRef = ref<HTMLElement | null>(null);

  const addFiles = (files: File[]) => {
    if (!enabled.value || files.length === 0) return;
    input.value?.addFiles(files);
  };

  const { isOverDropZone } = useDropZone(dropZoneRef, {
    onDrop: (files) => {
      if (files) addFiles(Array.from(files));
    },
    multiple: true,
    preventDefaultForUnhandled: false,
  });

  const handlePaste = (event: ClipboardEvent) => {
    if (!enabled.value) return;
    const files = Array.from(event.clipboardData?.files ?? []);
    if (files.length === 0) return;

    event.preventDefault();
    addFiles(files.map(normalizeClipboardFile));
  };

  onMounted(() => document.addEventListener("paste", handlePaste, true));
  onUnmounted(() => document.removeEventListener("paste", handlePaste, true));

  return { dropZoneRef, isOverDropZone };
}
