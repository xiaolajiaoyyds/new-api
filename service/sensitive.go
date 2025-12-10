package service

import (
	"errors"

	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/setting"
)

func CheckSensitiveMessages(messages []dto.Message) ([]string, error) {
	if len(messages) == 0 {
		return nil, nil
	}

	for _, message := range messages {
		arrayContent := message.ParseContent()
		for _, m := range arrayContent {
			if m.Type == "image_url" {
				// TODO: check image url
				continue
			}
			// 检查 text 是否为空
			if m.Text == "" {
				continue
			}
			if ok, words := SensitiveWordContains(m.Text); ok {
				return words, errors.New("sensitive words detected")
			}
		}
	}
	return nil, nil
}

func CheckSensitiveText(text string) (bool, []string) {
	return SensitiveWordContains(text)
}

// SensitiveWordContains 是否包含敏感词，返回是否包含敏感词和敏感词列表（支持正则）
func SensitiveWordContains(text string) (bool, []string) {
	if len(setting.SensitiveWords) == 0 || len(text) == 0 {
		return false, nil
	}
	return RegexSearch(text, setting.SensitiveWords, true)
}

// SensitiveWordReplace 敏感词替换，返回是否包含敏感词和替换后的文本（支持正则）
func SensitiveWordReplace(text string, returnImmediately bool) (bool, []string, string) {
	if len(setting.SensitiveWords) == 0 {
		return false, nil, text
	}

	var matches []string
	result := text

	for _, pattern := range setting.SensitiveWords {
		re := getOrCompileRegex(pattern)
		if re == nil {
			continue
		}
		if re.MatchString(result) {
			matches = append(matches, pattern)
			result = re.ReplaceAllString(result, "**###**")
			if returnImmediately {
				return true, matches, result
			}
		}
	}

	if len(matches) > 0 {
		return true, matches, result
	}
	return false, nil, text
}
