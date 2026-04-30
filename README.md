[![CI](https://github.com/HTWDEVRU/pi-polza-ai-provider/workflows/CI/badge.svg)](https://github.com/HTWDEVRU/pi-polza-ai-provider/actions)
![npm](https://img.shields.io/npm/v/@htwdev/pi-polza-ai-provider)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

# pi-polza-ai-provider

> Расширение для pi-coding-agent — провайдер моделей Polza.AI

Расширение для [pi-coding-agent](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent) — динамически загружает модели Polza.AI и регистрирует их как провайдер.

---

## Установка

Через `pi install`:

```bash
pi install git:github.com/HTWDEVRU/pi-polza-ai-provider
pi install npm:@HTWDEVRU/pi-polza-ai-provider --version latest
```

Или вручную:

```bash
git clone https://github.com/HTWDEVRU/pi-polza-ai-provider.git
cp pi-polza-ai-provider/index.ts ~/.pi/agent/extensions/polza-ai-provider.ts
```

## Настройка

Установите переменную окружения `POLZA_AI_API_KEY`:

```bash
# Linux / macOS
export POLZA_AI_API_KEY=ваш_ключ

# Windows (PowerShell)
$env:POLZA_AI_API_KEY = "ваш_ключ"

# Windows (CMD)
set POLZA_AI_API_KEY=ваш_ключ
```
Или используйте моё расширение, которое может грузить переменные прямо во время работы pi

https://github.com/HTWDEVRU/pi-env-loader

## Поведение

- Если `POLZA_AI_API_KEY` не указан, провайдер не появляется в списке моделей.
- После установки ключа провайдер автоматически появляется после выполнения любого запроса.

## Пример использования

```bash
# Запуск с extension
pi -e git:github.com/HTWDEVRU/pi-polza-ai-provider

# Установка и использование
pi
/model  # Polza.AI доступен в списке моделей
```

Vibecode

100%