{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "atlas-bot.bot.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "atlas-bot.bot.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}



{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "atlas-bot.bot.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "atlas-bot.bot.labels" -}}
helm.sh/chart: {{ include "atlas-bot.bot.chart" . }}
{{ include "atlas-bot.bot.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "atlas-bot.bot.selectorLabels" -}}
app.kubernetes.io/name: {{ include "atlas-bot.bot.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: bot
{{- end -}}



{{/*
Create the name of the service account to use
*/}}
{{- define "atlas-bot.bot.serviceAccountName" -}}
{{- if .Values.bot.serviceAccount.create -}}
    {{ default (include "atlas-bot.bot.fullname" .) .Values.bot.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.bot.serviceAccount.name }}
{{- end -}}
{{- end -}}