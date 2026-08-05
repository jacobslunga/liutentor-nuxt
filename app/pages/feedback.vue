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

const fieldClass =
  "w-full h-10 px-3 rounded-lg border border-input bg-transparent text-sm outline-none transition-colors duration-150 ease-spring placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary";

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
  <div>
    <PageIntro
      eyebrow="Support"
      title="Berätta vad som skaver."
      lead="Buggar, saknade tentor, en idé du haft mitt i pluggandet – allt hjälper. Vi läser varje meddelande."
    />

    <div class="mx-auto max-w-6xl px-5 sm:px-8">
      <div class="grid gap-x-12 gap-y-8 py-12 lg:grid-cols-[13rem_minmax(0,1fr)] lg:py-16">
        <p class="text-sm font-medium text-muted-foreground lg:sticky lg:top-24 lg:self-start">
          Formulär
        </p>

        <div class="max-w-xl">
          <div v-if="isSuccess === true" class="flex flex-col items-start gap-4">
            <div class="flex size-10 items-center justify-center rounded-full bg-success/10 dark:bg-success/15">
              <LucideCheck class="size-5 text-success" />
            </div>
            <div>
              <h2 class="text-xl font-medium">Tack!</h2>
              <p class="mt-1 text-sm text-muted-foreground">
                Vi har tagit emot din feedback och återkommer om det behövs.
              </p>
            </div>
            <Button size="sm" variant="outline" as-child>
              <NuxtLink to="/">Tillbaka till startsidan</NuxtLink>
            </Button>
          </div>

          <div v-else-if="isSuccess === false" class="flex flex-col items-start gap-4">
            <div class="flex size-10 items-center justify-center rounded-full bg-destructive/10 dark:bg-destructive/15">
              <LucideAlertCircle class="size-5 text-destructive" />
            </div>
            <div>
              <h2 class="text-xl font-medium">Något gick fel</h2>
              <p class="mt-1 text-sm text-muted-foreground">
                Försök igen eller kontakta oss direkt på liutentor@gmail.com
              </p>
            </div>
            <Button size="sm" variant="outline" @click="isSuccess = null">Försök igen</Button>
          </div>

          <form v-else class="space-y-6" @submit.prevent="handleSubmit">
            <div>
              <div class="mb-2 flex items-baseline justify-between">
                <label for="fb-name" class="text-sm font-medium">Namn</label>
                <span class="text-xs text-muted-foreground">Valfritt</span>
              </div>
              <input id="fb-name" v-model="form.name" placeholder="Ditt namn" :class="fieldClass" />
            </div>

            <div>
              <div class="mb-2 flex items-baseline justify-between">
                <label for="fb-mail" class="text-sm font-medium">LiU-mail</label>
                <span class="text-xs text-muted-foreground">Obligatoriskt</span>
              </div>
              <input
                id="fb-mail"
                v-model="form.liu_mail"
                placeholder="liuid123@student.liu.se"
                :class="[fieldClass, errors.liu_mail ? 'border-destructive' : '']"
              />
              <p v-if="errors.liu_mail" class="mt-1.5 text-xs text-destructive">
                {{ errors.liu_mail }}
              </p>
              <p v-else class="mt-1.5 text-xs text-muted-foreground">
                Format: liuid123@student.liu.se
              </p>
            </div>

            <div>
              <div class="mb-2 flex items-baseline justify-between">
                <label for="fb-part" class="text-sm font-medium">Del av hemsidan</label>
                <span class="text-xs text-muted-foreground">Valfritt</span>
              </div>
              <input
                id="fb-part"
                v-model="form.partOfWebsite"
                placeholder="t.ex. Söksidan, PDF-visaren..."
                :class="fieldClass"
              />
            </div>

            <div>
              <div class="mb-2 flex items-baseline justify-between">
                <label for="fb-message" class="text-sm font-medium">Meddelande</label>
                <span class="text-xs text-muted-foreground">Obligatoriskt</span>
              </div>
              <textarea
                id="fb-message"
                v-model="form.message"
                placeholder="Berätta vad du tänker..."
                rows="6"
                class="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors duration-150 ease-spring placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary"
                :class="errors.message ? 'border-destructive' : ''"
              />
              <p v-if="errors.message" class="mt-1.5 text-xs text-destructive">
                {{ errors.message }}
              </p>
              <p v-else class="mt-1.5 text-xs text-muted-foreground">Minst 10 tecken</p>
            </div>

            <div class="flex items-center justify-between border-t pt-6">
              <p class="text-xs text-muted-foreground">
                Vi använder din mail bara för att kunna svara.
              </p>
              <Button type="submit" size="sm" :disabled="isSubmitting">
                <LucideLoader2 v-if="isSubmitting" class="size-3.5 animate-spin" />
                Skicka
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
