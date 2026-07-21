const ANSWER_MODE_COOKIE_KEY = "liutentor_give_direct_answer_v1";

export function useAnswerMode() {
  const giveDirectAnswer = useCookie<boolean>(ANSWER_MODE_COOKIE_KEY, {
    default: () => true,
    maxAge: 60 * 60 * 24 * 365,
  });

  return { giveDirectAnswer };
}
