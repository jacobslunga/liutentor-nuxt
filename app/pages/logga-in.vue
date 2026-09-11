<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

definePageMeta({
  layout: "auth",
});

const route = useRoute();
const router = useRouter();
const activeTab = ref(
  route.query.tab === "skapa-konto" ? "skapa-konto" : "logga-in",
);

// Flikvärdena speglar ?tab=-parametern; `slot` pekar ut respektive formulär.
const authTabs: TabsItem[] = [
  { value: "logga-in", label: "Logga in", slot: "login" },
  { value: "skapa-konto", label: "Skapa konto", slot: "signup" },
];

const supabase = useSupabaseClient();

const seoTitle = computed(() =>
  activeTab.value === "logga-in" ? "Logga in" : "Skapa konto",
);

useSeoMeta({
  title: seoTitle,
  description: "Logga in till LiU Tentor",
});

watch(activeTab, (tab) => {
  router.replace({ query: { ...route.query, tab } });
});

const loginForm = reactive({
  email: "",
  password: "",
});

const loginErrors = reactive({
  email: "",
  password: "",
});

const loginLoading = ref(false);
const loginSuccess = ref(false);
const loginGeneralError = ref("");
const showLoginPassword = ref(false);

const signupForm = reactive({
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
});

const signupErrors = reactive({
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
});

const signupLoading = ref(false);
const signupSuccess = ref(false);
const showSignupPassword = ref(false);
const showSignupConfirm = ref(false);
const signupGeneralError = ref("");

const LIU_EMAIL_REGEX = /^[a-z]{5}\d{3}@student\.liu\.se$/;

function validateLiuEmail(email: string): string {
  if (!email) return "E-post krävs";
  if (!LIU_EMAIL_REGEX.test(email.toLowerCase()))
    return "Måste vara en giltig LiU-adress, t.ex. abcde123@student.liu.se";
  return "";
}

function validatePassword(password: string): string {
  if (!password) return "Lösenord krävs";
  if (password.length < 8) return "Minst 8 tecken krävs";
  return "";
}

function validateName(name: string, label: string): string {
  if (!name.trim()) return `${label} krävs`;
  if (name.trim().length < 2) return `${label} måste vara minst 2 tecken`;
  return "";
}

async function handleLogin() {
  loginErrors.email = validateLiuEmail(loginForm.email);
  loginErrors.password = validatePassword(loginForm.password);
  loginGeneralError.value = "";

  if (loginErrors.email || loginErrors.password) return;

  loginLoading.value = true;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginForm.email,
    password: loginForm.password,
  });
  loginLoading.value = false;

  if (error) {
    loginGeneralError.value = "Fel e-post eller lösenord. Försök igen.";
    return;
  }

  if (data.session) {
    loginSuccess.value = true;
    const delay = 800 + Math.random() * 400;
    await new Promise((r) => setTimeout(r, delay));
    navigateTo("/", { replace: true });
  } else {
    loginSuccess.value = false;
  }
}

async function handleSignup() {
  signupErrors.email = validateLiuEmail(signupForm.email);
  signupErrors.password = validatePassword(signupForm.password);
  signupErrors.firstName = validateName(signupForm.firstName, "Förnamn");
  signupErrors.lastName = validateName(signupForm.lastName, "Efternamn");
  signupErrors.confirmPassword =
    signupForm.confirmPassword !== signupForm.password
      ? "Lösenorden matchar inte"
      : signupForm.confirmPassword
        ? ""
        : "Bekräfta ditt lösenord";

  if (
    signupErrors.email ||
    signupErrors.password ||
    signupErrors.confirmPassword ||
    signupErrors.firstName ||
    signupErrors.lastName
  )
    return;

  signupLoading.value = true;
  signupGeneralError.value = "";

  const { data, error } = await supabase.auth.signUp({
    email: signupForm.email,
    password: signupForm.password,
  });

  if (error) {
    signupLoading.value = false;
    if (
      error.message.toLowerCase().includes("already registered") ||
      error.status === 422
    ) {
      signupGeneralError.value =
        "Det finns redan ett konto med den här e-postadressen.";
    } else {
      signupGeneralError.value = "Något gick fel. Försök igen.";
    }
    return;
  }

  if (data.user) {
    await (supabase as any)
      .from("profiles")
      .update({
        first_name: signupForm.firstName.trim(),
        last_name: signupForm.lastName.trim(),
      })
      .eq("id", data.user.id);
  }

  signupLoading.value = false;

  if (data.session) {
    await navigateTo("/", { replace: true });
  } else {
    signupSuccess.value = true;
  }
}
</script>

<template>
  <div class="w-full max-w-sm flex flex-col items-center space-y-8">
    <div class="flex flex-col items-center space-y-1 text-center">
      <NuxtLink to="/" class="flex items-center space-x-2 mb-1">
        <LogoIcon class="w-8 h-8" />
        <span class="font-logo text-xl tracking-tighter">LiU Tentor</span>
      </NuxtLink>
    </div>

    <UTabs color="neutral"
      v-model="activeTab"
      :items="authTabs"
      class="w-full"
      :ui="{ list: 'w-full', trigger: 'flex-1' }"
    >
      <template #login>
        <div v-if="loginSuccess" class="flex flex-col items-center space-y-3 py-6 text-center">
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UIcon name="i-lucide-check" class="w-6 h-6 text-primary" />
          </div>
          <p class="font-medium">Inloggad!</p>
          <p class="text-sm text-muted">
            Loggar in dig, tar dig till första sidan...
          </p>
          <UIcon name="i-lucide-loader-circle" class="w-4 h-4 animate-spin text-muted mt-1" />
        </div>

        <form v-else @submit.prevent="handleLogin" class="flex flex-col space-y-4">
          <div class="flex flex-col space-y-1.5">
            <label class="text-sm font-medium">LiU mail</label>
            <UInput v-model="loginForm.email" type="email" placeholder="abcde123@student.liu.se" autocomplete="email"
              :color="loginErrors.email ? 'error' : undefined" />
            <p v-if="loginErrors.email" class="text-xs text-error">
              {{ loginErrors.email }}
            </p>
          </div>

          <div class="flex flex-col space-y-1.5">
            <label class="text-sm font-medium">Lösenord</label>
            <UInput v-model="loginForm.password" :type="showLoginPassword ? 'text' : 'password'" placeholder="••••••••"
                autocomplete="current-password" :color="loginErrors.password ? 'error' : undefined">
                <template #trailing>
                  <UButton color="neutral" variant="link" size="sm"
                    :icon="showLoginPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    :aria-label="showLoginPassword ? 'Dölj lösenord' : 'Visa lösenord'"
                    @click="showLoginPassword = !showLoginPassword" />
                </template>
              </UInput>
            <p v-if="loginErrors.password" class="text-xs text-error">
              {{ loginErrors.password }}
            </p>
          </div>

          <p v-if="loginGeneralError" class="text-xs text-error text-center">
            {{ loginGeneralError }}
          </p>

          <UButton type="submit" block :disabled="loginLoading">
            <UIcon name="i-lucide-loader-circle" v-if="loginLoading" class="w-4 h-4 animate-spin" />
            <span v-else>Logga in</span>
          </UButton>

          <p class="text-xs text-center text-muted">
            Inget konto?
            <UButton variant="link" size="sm" class="text-highlighted underline-offset-2 hover:text-primary h-auto p-0"
              @click="activeTab = 'skapa-konto'">
              Skapa ett här
            </UButton>
          </p>
        </form>
      </template>

      <template #signup>
        <div v-if="signupSuccess" class="flex flex-col items-center space-y-3 py-6 text-center">
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UIcon name="i-lucide-mail" class="w-6 h-6 text-primary" />
          </div>
          <p class="font-medium">Konto skapat!</p>
          <p class="text-sm text-muted">
            Vi har skickat en bekräftelse till
            <span class="font-medium text-highlighted">{{
              signupForm.email
              }}</span>. Kontrollera din inkorg.
          </p>
          <UButton size="sm" color="neutral" variant="outline" class="mt-2" @click="
            () => {
              signupSuccess = false;
              activeTab = 'logga-in';
            }
          ">
            Gå till inloggning
          </UButton>
        </div>

        <form v-else @submit.prevent="handleSignup" class="flex flex-col space-y-4">
          <div class="flex gap-3">
            <div class="flex flex-col space-y-1.5 flex-1">
              <label class="text-sm font-medium">Förnamn</label>
              <UInput v-model="signupForm.firstName" type="text" placeholder="Förnamn" autocomplete="given-name"
                :color="signupErrors.firstName ? 'error' : undefined" />
              <p v-if="signupErrors.firstName" class="text-xs text-error">
                {{ signupErrors.firstName }}
              </p>
            </div>

            <div class="flex flex-col space-y-1.5 flex-1">
              <label class="text-sm font-medium">Efternamn</label>
              <UInput v-model="signupForm.lastName" type="text" placeholder="Efternamn" autocomplete="family-name"
                :color="signupErrors.lastName ? 'error' : undefined" />
              <p v-if="signupErrors.lastName" class="text-xs text-error">
                {{ signupErrors.lastName }}
              </p>
            </div>
          </div>

          <div class="flex flex-col space-y-1.5">
            <label class="text-sm font-medium">LiU mail</label>
            <UInput v-model="signupForm.email" type="email" placeholder="abcde123@student.liu.se" autocomplete="email"
              :color="signupErrors.email ? 'error' : undefined" />
            <p v-if="signupErrors.email" class="text-xs text-error">
              {{ signupErrors.email }}
            </p>
            <p v-else class="text-xs text-muted">
              Måste vara din LiU mail (t.ex. abcde123@student.liu.se)
            </p>
          </div>

          <div class="flex flex-col space-y-1.5">
            <label class="text-sm font-medium">Lösenord</label>
            <UInput v-model="signupForm.password" :type="showSignupPassword ? 'text' : 'password'"
                placeholder="••••••••" autocomplete="new-password" :color="signupErrors.password ? 'error' : undefined">
                <template #trailing>
                  <UButton color="neutral" variant="link" size="sm"
                    :icon="showSignupPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    :aria-label="showSignupPassword ? 'Dölj lösenord' : 'Visa lösenord'"
                    @click="showSignupPassword = !showSignupPassword" />
                </template>
              </UInput>
            <p v-if="signupErrors.password" class="text-xs text-error">
              {{ signupErrors.password }}
            </p>
            <p v-else class="text-xs text-muted">Minst 8 tecken</p>
          </div>

          <div class="flex flex-col space-y-1.5">
            <label class="text-sm font-medium">Bekräfta lösenord</label>
            <UInput v-model="signupForm.confirmPassword" :type="showSignupConfirm ? 'text' : 'password'"
                placeholder="••••••••" autocomplete="new-password" :color="signupErrors.confirmPassword ? 'error' : undefined">
                <template #trailing>
                  <UButton color="neutral" variant="link" size="sm"
                    :icon="showSignupConfirm ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    :aria-label="showSignupConfirm ? 'Dölj lösenord' : 'Visa lösenord'"
                    @click="showSignupConfirm = !showSignupConfirm" />
                </template>
              </UInput>
            <p v-if="signupErrors.confirmPassword" class="text-xs text-error">
              {{ signupErrors.confirmPassword }}
            </p>
          </div>

          <p v-if="signupGeneralError" class="text-xs text-error text-center">
            {{ signupGeneralError }}
          </p>

          <UButton type="submit" block :disabled="signupLoading">
            <UIcon name="i-lucide-loader-circle" v-if="signupLoading" class="w-4 h-4 animate-spin" />
            <span v-else>Skapa konto</span>
          </UButton>

          <p class="text-xs text-center text-muted">
            Har du redan ett konto?
            <UButton variant="link" size="sm" class="text-highlighted underline-offset-2 hover:text-primary h-auto p-0"
              @click="activeTab = 'logga-in'">
              Logga in
            </UButton>
          </p>
        </form>
      </template>
    </UTabs>
  </div>
</template>
