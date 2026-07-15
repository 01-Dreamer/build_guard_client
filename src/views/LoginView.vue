<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  ArrowRight,
  Key,
  Lock,
  Message,
  Refresh
} from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import logoUrl from '../assets/logo.ico'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const captcha = ref(createCaptcha())

interface LoginForm {
  email: string
  password: string
  captcha: string
}

const loginForm = reactive<LoginForm>({
  email: '',
  password: '',
  captcha: ''
})

const rules: FormRules<LoginForm> = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入图形验证码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (String(value).toLowerCase() !== captcha.value.toLowerCase()) {
          callback(new Error('验证码不正确'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
}

const captchaChars = computed(() => captcha.value.split(''))

function createCaptcha() {
  const source = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () =>
    source.charAt(Math.floor(Math.random() * source.length))
  ).join('')
}

function refreshCaptcha() {
  captcha.value = createCaptcha()
  loginForm.captcha = ''
  formRef.value?.clearValidate('captcha')
}

async function handleLogin() {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  window.setTimeout(() => {
    authStore.login({
      token: `mock-token-${Date.now()}`,
      user: {
        email: loginForm.email,
        name: '安全监管员'
      }
    })
    loading.value = false
    ElMessage.success('登录成功')

    const redirect = route.query.redirect
    router.replace(typeof redirect === 'string' ? redirect : '/')
  }, 700)
}
</script>

<template>
  <main class="login-shell">
    <section class="brand-panel" aria-label="BuildGuard platform overview">
      <div class="brand-content">
        <div class="brand-mark">
          <div class="brand-icon">
            <img :src="logoUrl" alt="BuildGuard" />
          </div>
          <div>
            <p class="brand-kicker">BUILDGUARD</p>
            <h1>建筑安全智能监控平台</h1>
          </div>
        </div>

        <div class="scene">
          <div class="tower tower-left">
            <span />
            <span />
            <span />
          </div>
          <div class="tower tower-right">
            <span />
            <span />
            <span />
          </div>
          <div class="crane-arm" />
          <div class="building-grid" />
          <div class="scan-line" />
        </div>
      </div>
    </section>

    <section class="login-panel" aria-label="系统登录">
      <div class="login-card">
        <div class="login-heading">
          <h2>账号登录</h2>
        </div>

        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="rules"
          class="login-form"
          size="large"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="email">
            <el-input v-model="loginForm.email" placeholder="请输入邮箱" clearable>
              <template #prefix>
                <el-icon>
                  <Message />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              placeholder="请输入密码"
              show-password
              type="password"
            >
              <template #prefix>
                <el-icon>
                  <Lock />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="captcha">
            <div class="captcha-row">
              <el-input
                v-model="loginForm.captcha"
                maxlength="4"
                placeholder="请输入验证码"
              >
                <template #prefix>
                  <el-icon>
                    <Key />
                  </el-icon>
                </template>
              </el-input>

              <button
                class="captcha-box"
                type="button"
                title="刷新验证码"
                @click="refreshCaptcha"
              >
                <span class="captcha-code">
                  <i
                    v-for="(char, index) in captchaChars"
                    :key="`${char}-${index}`"
                    :style="{ transform: `rotate(${index % 2 ? -7 : 6}deg)` }"
                  >
                    {{ char }}
                  </i>
                </span>
                <el-icon>
                  <Refresh />
                </el-icon>
              </button>
            </div>
          </el-form-item>

          <el-button
            class="login-button"
            :loading="loading"
            type="primary"
            @click="handleLogin"
          >
            登录系统
            <el-icon class="button-icon">
              <ArrowRight />
            </el-icon>
          </el-button>
        </el-form>
      </div>
    </section>
  </main>
</template>

<style scoped>
.login-shell {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(420px, 0.92fr);
  min-height: 100vh;
  overflow: hidden;
  background:
    linear-gradient(115deg, rgba(14, 18, 24, 0.94), rgba(14, 18, 24, 0.68)),
    radial-gradient(circle at 85% 15%, rgba(245, 158, 11, 0.22), transparent 34%),
    linear-gradient(135deg, #111820 0%, #1d2733 42%, #23231d 100%);
}

.login-shell::before {
  position: absolute;
  inset: 0;
  content: "";
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(90deg, #000 0%, rgba(0, 0, 0, 0.3) 70%, transparent 100%);
  pointer-events: none;
}

.brand-panel,
.login-panel {
  position: relative;
  z-index: 1;
}

.brand-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(32px, 5vw, 76px);
  color: #f8fafc;
}

.brand-content {
  width: 100%;
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: 22px;
}

.brand-icon {
  display: grid;
  flex: 0 0 76px;
  width: 76px;
  height: 76px;
  place-items: center;
  overflow: hidden;
  background: rgba(248, 250, 252, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 20px;
  box-shadow: 0 18px 48px rgba(14, 165, 233, 0.2);
}

.brand-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.56);
}

.brand-kicker {
  margin: 0 0 8px;
  color: #fbbf24;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  max-width: none;
  margin-bottom: 0;
  font-size: clamp(42px, 4vw, 64px);
  line-height: 1.04;
  letter-spacing: 0;
  white-space: nowrap;
}

.scene {
  position: relative;
  width: min(680px, 100%);
  min-height: 410px;
  margin: 76px 0 0;
  border-bottom: 1px solid rgba(251, 191, 36, 0.42);
}

.building-grid {
  position: absolute;
  right: 5%;
  bottom: 0;
  width: 42%;
  height: 58%;
  background:
    linear-gradient(90deg, rgba(34, 211, 238, 0.18) 1px, transparent 1px),
    linear-gradient(rgba(34, 211, 238, 0.18) 1px, transparent 1px),
    linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(31, 41, 55, 0.8));
  background-size: 34px 34px, 34px 34px, auto;
  border: 1px solid rgba(34, 211, 238, 0.25);
  border-radius: 8px 8px 0 0;
}

.tower {
  position: absolute;
  bottom: 0;
  width: 94px;
  height: 78%;
  border-right: 5px solid rgba(251, 191, 36, 0.88);
  border-left: 5px solid rgba(251, 191, 36, 0.88);
}

.tower-left {
  left: 7%;
}

.tower-right {
  left: 33%;
  height: 66%;
  opacity: 0.72;
}

.tower span {
  position: absolute;
  left: 0;
  width: 120%;
  height: 4px;
  background: rgba(251, 191, 36, 0.72);
  transform: rotate(-29deg);
  transform-origin: left center;
}

.tower span:nth-child(1) {
  top: 22%;
}

.tower span:nth-child(2) {
  top: 48%;
}

.tower span:nth-child(3) {
  top: 73%;
}

.crane-arm {
  position: absolute;
  left: 7%;
  top: 16%;
  width: 58%;
  height: 6px;
  background: linear-gradient(90deg, #fbbf24, rgba(251, 191, 36, 0.18));
  box-shadow: 0 0 26px rgba(251, 191, 36, 0.22);
}

.crane-arm::before,
.crane-arm::after {
  position: absolute;
  content: "";
  background: rgba(251, 191, 36, 0.68);
}

.crane-arm::before {
  right: 14%;
  top: 6px;
  width: 2px;
  height: 92px;
}

.crane-arm::after {
  right: calc(14% - 10px);
  top: 94px;
  width: 24px;
  height: 18px;
  border-radius: 3px;
}

.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 44%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #22d3ee, transparent);
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.75);
}

.login-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.login-card {
  width: min(100%, 460px);
  padding: 42px;
  background: rgba(248, 250, 252, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.68);
  border-radius: 8px;
  box-shadow: 0 28px 80px rgba(2, 6, 23, 0.32);
}

.login-heading {
  margin-bottom: 30px;
}

.login-heading h2 {
  margin-bottom: 0;
  color: #111827;
  font-size: 34px;
  line-height: 1.2;
  letter-spacing: 0;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.login-form :deep(.el-input__wrapper) {
  min-height: 50px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #d7dde6 inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #0f766e inset;
}

.login-form :deep(.el-input__prefix) {
  color: #64748b;
}

.captcha-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 142px;
  gap: 12px;
  width: 100%;
}

.captcha-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  height: 50px;
  padding: 0 12px;
  color: #111827;
  cursor: pointer;
  background:
    linear-gradient(135deg, rgba(251, 191, 36, 0.28), rgba(34, 211, 238, 0.22)),
    repeating-linear-gradient(
      -35deg,
      rgba(15, 23, 42, 0.08) 0,
      rgba(15, 23, 42, 0.08) 2px,
      transparent 2px,
      transparent 9px
    ),
    #f8fafc;
  border: 1px solid #d7dde6;
  border-radius: 8px;
}

.captcha-code {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  min-width: 78px;
  font-family: "Courier New", monospace;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0;
}

.captcha-code i {
  font-style: normal;
}

.captcha-box .el-icon {
  flex: 0 0 auto;
  color: #475569;
}

.login-button {
  width: 100%;
  min-height: 52px;
  margin-top: 4px;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #0f766e, #111827);
  border: 0;
  border-radius: 8px;
}

.login-button:hover,
.login-button:focus {
  background: linear-gradient(135deg, #115e59, #0f172a);
}

.button-icon {
  margin-left: 8px;
}

@media (max-width: 980px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    min-height: 48vh;
    padding-bottom: 24px;
  }

  .scene {
    min-height: 260px;
    margin: 20px 0;
  }

  .login-panel {
    align-items: flex-start;
    padding-top: 0;
  }
}

@media (max-width: 640px) {
  .brand-panel,
  .login-panel {
    padding: 22px;
  }

  .brand-mark {
    align-items: flex-start;
  }

  .brand-icon {
    flex-basis: 52px;
    width: 52px;
    height: 52px;
    border-radius: 14px;
  }

  h1 {
    font-size: clamp(28px, 8.4vw, 40px);
    white-space: normal;
  }

  .scene {
    display: none;
  }

  .login-card {
    padding: 28px 22px;
  }

  .captcha-row {
    grid-template-columns: 1fr;
  }

  .captcha-box {
    width: 100%;
  }
}
</style>
