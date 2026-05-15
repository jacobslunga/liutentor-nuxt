<script setup lang="ts">
import { useDropZone } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    initialCourseCode?: string;
    fixedCourseCode?: boolean;
    showHeading?: boolean;
  }>(),
  {
    initialCourseCode: "",
    fixedCourseCode: false,
    showHeading: true,
  },
);

const kurskod = ref(props.initialCourseCode.toUpperCase());
const files = ref<File[]>([]);
const loading = ref(false);
const uploadStatus = ref<"success" | "error" | null>(null);
const errorMessage = ref("");
const dropZoneRef = ref<HTMLDivElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

watch(
  () => props.initialCourseCode,
  (courseCode) => {
    if (props.fixedCourseCode) {
      kurskod.value = courseCode.toUpperCase();
    }
  },
);

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: (droppedFiles) => {
    if (!droppedFiles) return;
    files.value = [
      ...files.value,
      ...Array.from(droppedFiles).filter((f) => f.type === "application/pdf"),
    ];
  },
});

function handleFileInput(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files) return;
  files.value = [...files.value, ...Array.from(input.files)];
  input.value = "";
}

function removeFile(index: number) {
  files.value = files.value.filter((_, i) => i !== index);
}

function parseDateFromFilename(name: string): string | null {
  const fullDateMatch = name.match(/(\d{4})[-_]?(\d{2})[-_]?(\d{2})/);
  if (
    fullDateMatch &&
    fullDateMatch[1] &&
    fullDateMatch[2] &&
    fullDateMatch[3]
  ) {
    const year = parseInt(fullDateMatch[1], 10);
    const month = parseInt(fullDateMatch[2], 10);
    const day = parseInt(fullDateMatch[3], 10);
    if (
      year > 1990 &&
      year < 2050 &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31
    ) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  const shortDateMatch = name.match(/(?<!\d)(\d{2})(\d{2})(\d{2})(?!\d)/);
  if (
    shortDateMatch &&
    shortDateMatch[1] &&
    shortDateMatch[2] &&
    shortDateMatch[3]
  ) {
    const year = parseInt(shortDateMatch[1], 10);
    const month = parseInt(shortDateMatch[2], 10);
    const day = parseInt(shortDateMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${2000 + year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  return null;
}

function isSolution(name: string): boolean {
  const n = name.toLowerCase();
  const keywords = [
    "lösningsförslag",
    "facit",
    "solution",
    "losning",
    "sol",
    "lsn",
    "lösning",
    "tenlsg",
    "lf",
    "svar",
  ];
  if (n.includes("tenta_och_svar")) return false;
  return keywords.some((k) => n.includes(k));
}

async function handleUpload() {
  if (!files.value.length || !kurskod.value) return;
  loading.value = true;
  errorMessage.value = "";
  let successCount = 0;
  const normalizedCourseCode = kurskod.value.toUpperCase().trim();

  for (const file of files.value) {
    try {
      const examDate = parseDateFromFilename(file.name);
      if (!examDate)
        throw new Error(`Kunde inte hitta ett datum i filnamnet: ${file.name}`);

      const fileType = isSolution(file.name) ? "SOLUTION" : "EXAM";
      const normalizedFilename = `${normalizedCourseCode}_${examDate}_${fileType}.pdf`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("courseCode", normalizedCourseCode);
      formData.append("originalFilename", file.name);
      formData.append("normalizedFilename", normalizedFilename);
      formData.append("examDate", examDate);
      formData.append("fileType", fileType);

      await $fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      successCount++;
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "Okänt fel";
      break;
    }
  }

  loading.value = false;
  uploadStatus.value =
    successCount > 0 && successCount === files.value.length
      ? "success"
      : "error";
  if (successCount > 0) {
    files.value = [];
    if (!props.fixedCourseCode) {
      kurskod.value = "";
    }
  }
}

const typed = ref("");
const exIndex = ref(0);
const charIndex = ref(0);
const deleting = ref(false);
let typingTimer: ReturnType<typeof setTimeout> | null = null;
const shuffledExamples = ref<string[]>([]);

async function loadExampleCourseCodes() {
  if (props.fixedCourseCode || shuffledExamples.value.length) return;
  const { default: courseCodes } = await import("~/data/courseCodes.json");
  shuffledExamples.value = [...courseCodes].sort(() => Math.random() - 0.5);
  exIndex.value = Math.floor(Math.random() * shuffledExamples.value.length);
}

function runTyping() {
  if (kurskod.value || props.fixedCourseCode) return;
  const current =
    shuffledExamples.value[exIndex.value % shuffledExamples.value.length] ?? "";
  if (!current) return;
  const doneTyping = charIndex.value === current.length && !deleting.value;
  const doneDeleting = charIndex.value === 0 && deleting.value;
  const speed = deleting.value ? 30 : 55;
  const pause = doneTyping ? 1200 : doneDeleting ? 500 : 0;
  typingTimer = setTimeout(() => {
    if (doneTyping) {
      deleting.value = true;
    } else if (doneDeleting) {
      deleting.value = false;
      exIndex.value = (exIndex.value + 1) % shuffledExamples.value.length;
    } else {
      charIndex.value += deleting.value ? -1 : 1;
      typed.value = current.slice(0, charIndex.value);
    }
    runTyping();
  }, pause || speed);
}

watch(kurskod, (val) => {
  if (props.fixedCourseCode) return;
  if (val && typingTimer) {
    clearTimeout(typingTimer);
    typingTimer = null;
  } else if (!val && !typingTimer) runTyping();
});

onMounted(async () => {
  await loadExampleCourseCodes();
  runTyping();
});
onUnmounted(() => {
  if (typingTimer) clearTimeout(typingTimer);
});
</script>

<template>
  <div class="w-full">
    <div v-if="showHeading" class="mb-8">
      <h1 class="text-3xl font-semibold text-foreground mb-2">
        Ladda upp tenta
      </h1>
      <p class="text-sm font-medium text-muted-foreground">
        Hjälp andra studenter genom att ladda upp gamla tentor och facit.
      </p>
    </div>

    <div class="space-y-6">
      <div v-if="fixedCourseCode" class="space-y-2">
        <p class="text-sm font-medium text-muted-foreground">Kurskod</p>
        <div
          class="flex items-center justify-center gap-2 rounded-md border border-border/60 bg-muted/30 px-4 py-3"
        >
          <LucideBookOpen class="h-4 w-4 text-muted-foreground" />
          <span class="font-mono text-lg font-semibold tracking-wide">
            {{ kurskod }}
          </span>
        </div>
      </div>

      <div v-else class="space-y-2">
        <label class="text-sm font-medium text-muted-foreground">Kurskod</label>
        <input
          :value="kurskod"
          :placeholder="kurskod ? '' : typed"
          :disabled="loading"
          class="w-full bg-transparent font-medium outline-none border-0 border-b-2 border-foreground/20 text-center text-4xl focus:ring-0 focus:border-primary transition-colors p-2 placeholder:text-muted-foreground/40"
          @input="
            kurskod = ($event.target as HTMLInputElement).value.toUpperCase()
          "
        />
      </div>

      <div
        ref="dropZoneRef"
        class="relative border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-all"
        :class="
          isOverDropZone
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-muted hover:border-primary/50'
        "
        :style="loading ? 'opacity: 0.5; pointer-events: none' : ''"
        @click="fileInputRef?.click()"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept="application/pdf"
          multiple
          class="hidden"
          @change="handleFileInput"
        />
        <div
          class="flex flex-col items-center justify-center gap-2 text-muted-foreground"
        >
          <LucideUpload class="h-8 w-8" />
          <p class="font-medium">
            Dra och släpp PDF-filer här, eller klicka för att välja
          </p>
        </div>
      </div>

      <div v-if="files.length > 0" class="space-y-3">
        <div class="space-y-2 rounded-md border p-2">
          <div
            v-for="(file, index) in files"
            :key="`${file.name}-${index}`"
            class="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
          >
            <div class="flex items-center gap-2 overflow-hidden">
              <LucideFileText class="h-4 w-4 shrink-0 text-muted-foreground" />
              <span class="truncate">{{ file.name }}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              class="h-6 w-6"
              @click.stop="removeFile(index)"
            >
              <LucideX class="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button
          class="w-full"
          size="lg"
          :disabled="!kurskod || loading"
          @click="handleUpload"
        >
          <LucideLoader2 v-if="loading" class="h-5 w-5 animate-spin" />
          <span v-else>Ladda upp</span>
        </Button>
      </div>

      <div
        class="p-4 bg-muted/50 border rounded-md flex items-start gap-2 text-left"
      >
        <LucideInfo class="h-4 w-4 text-muted-foreground shrink-0" />
        <p class="text-xs text-muted-foreground">
          Uppladdade tentor granskas innan de blir tillgängliga för andra
          studenter.
        </p>
      </div>
    </div>

    <AlertDialog :open="uploadStatus !== null">
      <AlertDialogContent>
        <AlertDialogHeader class="text-center">
          <div class="flex justify-center mb-2">
            <LucideCheckCircle
              v-if="uploadStatus === 'success'"
              class="h-12 w-12 text-green-500"
            />
            <LucideAlertCircle v-else class="h-12 w-12 text-red-500" />
          </div>
          <AlertDialogTitle class="text-xl">
            {{
              uploadStatus === "success"
                ? "Uppladdning lyckades!"
                : "Något gick fel"
            }}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {{
              uploadStatus === "success"
                ? "Tack! Din tenta har laddats upp och granskas inom kort."
                : errorMessage || "Ett fel uppstod vid uppladdningen."
            }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction class="w-full" @click="uploadStatus = null">
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
