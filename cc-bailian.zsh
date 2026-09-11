#!/bin/zsh

BASE_URL="https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1"
MODEL="qwen3.8-max"

echo -n "Enter Bailian API Key: "
read -s API_KEY
echo

if [[ -z "$API_KEY" ]]; then
  echo "ERROR: API key cannot be empty."
  exit 1
fi

export ANTHROPIC_BASE_URL="$BASE_URL"
export ANTHROPIC_AUTH_TOKEN="$API_KEY"

export ANTHROPIC_MODEL="$MODEL"
export ANTHROPIC_DEFAULT_OPUS_MODEL="$MODEL"
export ANTHROPIC_DEFAULT_SONNET_MODEL="$MODEL"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="$MODEL"
export CLAUDE_CODE_SUBAGENT_MODEL="$MODEL"

echo
echo "Claude Code configured:"
echo "Base URL: $ANTHROPIC_BASE_URL"
echo "Model:    $ANTHROPIC_MODEL"
echo

claude
