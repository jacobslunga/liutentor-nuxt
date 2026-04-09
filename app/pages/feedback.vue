<script setup lang="ts">
definePageMeta({ layout: "info" });

useSeoMeta({
  title: "Feedback",
  description: "Skicka feedback till LiU Tentor-teamet.",
  robots: "index, follow",
});

const form = reactive({
  name: "",
  liu_mail: "",
  partOfWebsite: "",
  message: "",
});

const errors = reactive({
  liu_mail: "",
  message: "",
});

const isSuccess = ref<boolean | null>(null);
const isSubmitting = ref(false);

function validate() {
  errors.liu_mail = "";
  errors.message = "";
  let valid = true;

  if (!form.liu_mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.liu_mail)) {
    errors.liu_mail = "Ogiltig e-postadress";
    valid = false;
  }
  if (form.message.length < 10) {
    errors.message = "Meddelande måste innehålla minst 10 tecken";
    valid = false;
  }
  return valid;
}

async function handleSubmit() {
  if (!validate()) return;
  isSubmitting.value = true;
  try {
    await $fetch("/api/feedback", {
      method: "POST",
      body: {
        name: form.name,
        message: form.message,
        part_of_website: form.partOfWebsite,
        liu_mail: form.liu_mail,
      },
    });
    isSuccess.value = true;
    Object.assign(form, {
      name: "",
      liu_mail: "",
      partOfWebsite: "",
      message: "",
    });
  } catch {
    isSuccess.value = false;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="w-full max-w-2xl">
    <h1 class="text-3xl font-semibold text-foreground mb-2">Feedback</h1>
    <p class="text-sm font-normal text-muted-foreground mb-6">
      Hjälp oss bli bättre – dela dina tankar och förslag.
    </p>

    <div
      v-if="isSuccess === true"
      class="flex flex-col items-center gap-4 text-center py-8"
    >
      <div
        class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
      >
        <LucideCheck class="h-6 w-6 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <h2 class="text-xl font-normal mb-1">Tack!</h2>
        <p class="text-sm text-muted-foreground">
          Vi har tagit emot din feedback och återkommer om det behövs.
        </p>
      </div>
      <NuxtLink to="/"
        ><Button size="sm">Tillbaka till startsidan</Button></NuxtLink
      >
    </div>

    <div
      v-else-if="isSuccess === false"
      class="flex flex-col items-center gap-4 text-center py-8"
    >
      <div
        class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
      >
        <LucideAlertCircle class="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <h2 class="text-xl font-normal mb-1">Något gick fel</h2>
        <p class="text-sm text-muted-foreground">
          Försök igen eller kontakta oss direkt på liutentor@gmail.com
        </p>
      </div>
      <Button size="sm" @click="isSuccess = null">Försök igen</Button>
    </div>

    <form v-else class="space-y-5" @submit.prevent="handleSubmit">
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-normal">Namn</span>
          <span class="text-sm text-muted-foreground">Valfritt</span>
        </div>
        <input
          v-model="form.name"
          placeholder="Ditt namn"
          class="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-normal">LiU Mail</span>
          <span class="text-destructive text-sm">*</span>
        </div>
        <input
          v-model="form.liu_mail"
          placeholder="liuid123@student.liu.se"
          class="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring"
          :class="errors.liu_mail ? 'border-destructive' : ''"
        />
        <p v-if="errors.liu_mail" class="text-xs text-destructive mt-1">
          {{ errors.liu_mail }}
        </p>
        <p class="text-xs text-muted-foreground mt-1">
          Format: liuid123@student.liu.se
        </p>
      </div>

      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-normal">Del av hemsidan</span>
          <span class="text-sm text-muted-foreground">Valfritt</span>
        </div>
        <input
          v-model="form.partOfWebsite"
          placeholder="t.ex. Söksidan, PDF-visaren..."
          class="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-normal">Meddelande</span>
          <span class="text-destructive text-sm">*</span>
        </div>
        <textarea
          v-model="form.message"
          placeholder="Berätta vad du tänker..."
          rows="5"
          class="w-full px-3 py-2 rounded-md border border-input bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring resize-none"
          :class="errors.message ? 'border-destructive' : ''"
        />
        <p v-if="errors.message" class="text-xs text-destructive mt-1">
          {{ errors.message }}
        </p>
        <p class="text-xs text-muted-foreground mt-1">Minst 10 tecken</p>
      </div>

      <div class="flex items-center justify-between pt-2">
        <p class="text-xs text-muted-foreground">
          <span class="text-destructive">*</span> Obligatoriskt fält
        </p>
        <Button type="submit" size="sm" :disabled="isSubmitting">
          <LucideLoader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          Skicka
        </Button>
      </div>
    </form>
  </div>
</template>
