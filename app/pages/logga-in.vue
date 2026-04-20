<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const route = useRoute();
const router = useRouter();
const activeTab = ref(
  route.query.tab === "skapa-konto" ? "skapa-konto" : "logga-in",
);

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

// Login form
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

// Signup form
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

    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="w-full">
        <TabsTrigger value="logga-in" class="flex-1">Logga in</TabsTrigger>
        <TabsTrigger value="skapa-konto" class="flex-1"
          >Skapa konto</TabsTrigger
        >
      </TabsList>

      <!-- Login tab -->
      <TabsContent value="logga-in" class="mt-6">
        <div
          v-if="loginSuccess"
          class="flex flex-col items-center space-y-3 py-6 text-center"
        >
          <div
            class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <LucideCheck class="w-6 h-6 text-primary" />
          </div>
          <p class="font-medium">Inloggad!</p>
          <p class="text-sm text-muted-foreground">
            Loggar in dig, tar dig till första sidan...
          </p>
          <LucideLoader2
            class="w-4 h-4 animate-spin text-muted-foreground mt-1"
          />
        </div>

        <form
          v-else
          @submit.prevent="handleLogin"
          class="flex flex-col space-y-4"
        >
          <div class="flex flex-col space-y-1.5">
            <label class="text-sm font-medium">LiU mail</label>
            <Input
              v-model="loginForm.email"
              type="email"
              placeholder="abcde123@student.liu.se"
              autocomplete="email"
              :aria-invalid="!!loginErrors.email"
              :class="loginErrors.email ? 'border-destructive' : ''"
            />
            <p v-if="loginErrors.email" class="text-xs text-destructive">
              {{ loginErrors.email }}
            </p>
          </div>

          <div class="flex flex-col space-y-1.5">
            <label class="text-sm font-medium">Lösenord</label>
            <div class="relative">
              <Input
                v-model="loginForm.password"
                :type="showLoginPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                :aria-invalid="!!loginErrors.password"
                :class="
                  loginErrors.password ? 'border-destructive pr-10' : 'pr-10'
                "
              />
              <button
                type="button"
                tabindex="-1"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                @click="showLoginPassword = !showLoginPassword"
              >
                <LucideEye v-if="!showLoginPassword" class="w-4 h-4" />
                <LucideEyeOff v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="loginErrors.password" class="text-xs text-destructive">
              {{ loginErrors.password }}
            </p>
          </div>

          <p
            v-if="loginGeneralError"
            class="text-xs text-destructive text-center"
          >
            {{ loginGeneralError }}
          </p>

          <Button type="submit" class="w-full" :disabled="loginLoading">
            <LucideLoader2 v-if="loginLoading" class="w-4 h-4 animate-spin" />
            <span v-else>Logga in</span>
          </Button>

          <p class="text-xs text-center text-muted-foreground">
            Inget konto?
            <button
              type="button"
              class="text-foreground cursor-pointer underline underline-offset-2 hover:text-primary transition-colors"
              @click="activeTab = 'skapa-konto'"
            >
              Skapa ett här
            </button>
          </p>
        </form>
      </TabsContent>

      <!-- Signup tab -->
      <TabsContent value="skapa-konto" class="mt-6">
        <div
          v-if="signupSuccess"
          class="flex flex-col items-center space-y-3 py-6 text-center"
        >
          <div
            class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <LucideMailCheck class="w-6 h-6 text-primary" />
          </div>
          <p class="font-medium">Konto skapat!</p>
          <p class="text-sm text-muted-foreground">
            Vi har skickat en bekräftelse till
            <span class="font-medium text-foreground">{{
              signupForm.email
            }}</span
            >. Kontrollera din inkorg.
          </p>
          <Button
            size="sm"
            variant="outline"
            class="mt-2"
            @click="
              () => {
                signupSuccess = false;
                activeTab = 'logga-in';
              }
            "
          >
            Gå till inloggning
          </Button>
        </div>

        <form
          v-else
          @submit.prevent="handleSignup"
          class="flex flex-col space-y-4"
        >
          <div class="flex gap-3">
            <div class="flex flex-col space-y-1.5 flex-1">
              <label class="text-sm font-medium">Förnamn</label>
              <Input
                v-model="signupForm.firstName"
                type="text"
                placeholder="Förnamn"
                autocomplete="given-name"
                :aria-invalid="!!signupErrors.firstName"
                :class="signupErrors.firstName ? 'border-destructive' : ''"
              />
              <p v-if="signupErrors.firstName" class="text-xs text-destructive">
                {{ signupErrors.firstName }}
              </p>
            </div>

            <div class="flex flex-col space-y-1.5 flex-1">
              <label class="text-sm font-medium">Efternamn</label>
              <Input
                v-model="signupForm.lastName"
                type="text"
                placeholder="Efternamn"
                autocomplete="family-name"
                :aria-invalid="!!signupErrors.lastName"
                :class="signupErrors.lastName ? 'border-destructive' : ''"
              />
              <p v-if="signupErrors.lastName" class="text-xs text-destructive">
                {{ signupErrors.lastName }}
              </p>
            </div>
          </div>

          <div class="flex flex-col space-y-1.5">
            <label class="text-sm font-medium">LiU mail</label>
            <Input
              v-model="signupForm.email"
              type="email"
              placeholder="abcde123@student.liu.se"
              autocomplete="email"
              :aria-invalid="!!signupErrors.email"
              :class="signupErrors.email ? 'border-destructive' : ''"
            />
            <p v-if="signupErrors.email" class="text-xs text-destructive">
              {{ signupErrors.email }}
            </p>
            <p v-else class="text-xs text-muted-foreground">
              Måste vara din LiU mail (t.ex. abcde123@student.liu.se)
            </p>
          </div>

          <div class="flex flex-col space-y-1.5">
            <label class="text-sm font-medium">Lösenord</label>
            <div class="relative">
              <Input
                v-model="signupForm.password"
                :type="showSignupPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="new-password"
                :aria-invalid="!!signupErrors.password"
                :class="
                  signupErrors.password ? 'border-destructive pr-10' : 'pr-10'
                "
              />
              <button
                type="button"
                tabindex="-1"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                @click="showSignupPassword = !showSignupPassword"
              >
                <LucideEye v-if="!showSignupPassword" class="w-4 h-4" />
                <LucideEyeOff v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="signupErrors.password" class="text-xs text-destructive">
              {{ signupErrors.password }}
            </p>
            <p v-else class="text-xs text-muted-foreground">Minst 8 tecken</p>
          </div>

          <div class="flex flex-col space-y-1.5">
            <label class="text-sm font-medium">Bekräfta lösenord</label>
            <div class="relative">
              <Input
                v-model="signupForm.confirmPassword"
                :type="showSignupConfirm ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="new-password"
                :aria-invalid="!!signupErrors.confirmPassword"
                :class="
                  signupErrors.confirmPassword
                    ? 'border-destructive pr-10'
                    : 'pr-10'
                "
              />
              <button
                type="button"
                tabindex="-1"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                @click="showSignupConfirm = !showSignupConfirm"
              >
                <LucideEye v-if="!showSignupConfirm" class="w-4 h-4" />
                <LucideEyeOff v-else class="w-4 h-4" />
              </button>
            </div>
            <p
              v-if="signupErrors.confirmPassword"
              class="text-xs text-destructive"
            >
              {{ signupErrors.confirmPassword }}
            </p>
          </div>

          <p
            v-if="signupGeneralError"
            class="text-xs text-destructive text-center"
          >
            {{ signupGeneralError }}
          </p>

          <Button type="submit" class="w-full" :disabled="signupLoading">
            <LucideLoader2 v-if="signupLoading" class="w-4 h-4 animate-spin" />
            <span v-else>Skapa konto</span>
          </Button>

          <p class="text-xs text-center text-muted-foreground">
            Har du redan ett konto?
            <button
              type="button"
              class="text-foreground cursor-pointer underline underline-offset-2 hover:text-primary transition-colors"
              @click="activeTab = 'logga-in'"
            >
              Logga in
            </button>
          </p>
        </form>
      </TabsContent>
    </Tabs>
  </div>
</template>
