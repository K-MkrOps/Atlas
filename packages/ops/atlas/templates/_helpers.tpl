{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
# {{- define "atlas.name" -}}
# {{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
# {{- end -}}

{{- define "atlas.analytics.name" -}}
{{- default .Chart.Name .Values.analytics.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "atlas.client.name" -}}
{{- default .Chart.Name .Values.client.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "atlas.api.name" -}}
{{- default .Chart.Name .Values.api.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "atlas.media.name" -}}
{{- default .Chart.Name .Values.media.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "atlas.gameserver.name" -}}
{{- default .Chart.Name .Values.gameserver.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "atlas.editor.name" -}}
{{- default .Chart.Name .Values.editor.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "atlas.testbot.name" -}}
{{- default .Chart.Name (.Values.testbot).nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "atlas.fullname" -}}
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


{{- define "atlas.analytics.fullname" -}}
{{- if .Values.analytics.fullnameOverride -}}
{{- .Values.analytics.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.analytics.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}


{{- define "atlas.client.fullname" -}}
{{- if .Values.client.fullnameOverride -}}
{{- .Values.client.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.client.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}


{{- define "atlas.api.fullname" -}}
{{- if .Values.api.fullnameOverride -}}
{{- .Values.api.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.api.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}


{{- define "atlas.media.fullname" -}}
{{- if .Values.media.fullnameOverride -}}
{{- .Values.media.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.media.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "atlas.gameserver.fullname" -}}
{{- if .Values.gameserver.fullnameOverride -}}
{{- .Values.gameserver.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.gameserver.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}


{{- define "atlas.testbot.fullname" -}}
{{- if (.Values.testbot).fullnameOverride -}}
{{- .Values.testbot.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name (.Values.testbot).name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "atlas.client.host" -}}
{{- printf "%s.%s.%s" "dashboard" .Release.Name .Values.domain -}}
{{- end -}}


{{- define "atlas.media.host" -}}
{{- printf "%s.%s.%s" "media" .Release.Name .Values.domain -}}
{{- end -}}



{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "atlas.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "atlas.analytics.labels" -}}
helm.sh/chart: {{ include "atlas.chart" . }}
{{ include "atlas.analytics.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "atlas.analytics.selectorLabels" -}}
app.kubernetes.io/name: {{ include "atlas.analytics.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: analytics
{{- end -}}

{{/*
Common labels
*/}}
{{- define "atlas.client.labels" -}}
helm.sh/chart: {{ include "atlas.chart" . }}
{{ include "atlas.client.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "atlas.client.selectorLabels" -}}
app.kubernetes.io/name: {{ include "atlas.client.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: client
{{- end -}}


{{/*
Common labels
*/}}
{{- define "atlas.api.labels" -}}
helm.sh/chart: {{ include "atlas.chart" . }}
{{ include "atlas.api.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "atlas.api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "atlas.api.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: api
{{- end -}}


{{/*
Common labels
*/}}
{{- define "atlas.media.labels" -}}
helm.sh/chart: {{ include "atlas.chart" . }}
{{ include "atlas.media.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "atlas.media.selectorLabels" -}}
app.kubernetes.io/name: {{ include "atlas.media.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: media
{{- end -}}

{{/*
Common labels
*/}}
{{- define "atlas.gameserver.labels" -}}
helm.sh/chart: {{ include "atlas.chart" . }}
{{ include "atlas.gameserver.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "atlas.gameserver.selectorLabels" -}}
app.kubernetes.io/name: {{ include "atlas.gameserver.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: gameserver
{{- end -}}


{{/*
Common labels
*/}}
{{- define "atlas.testbot.labels" -}}
helm.sh/chart: {{ include "atlas.chart" . }}
{{ include "atlas.testbot.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "atlas.testbot.selectorLabels" -}}
app.kubernetes.io/name: {{ include "atlas.testbot.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: testbot
{{- end -}}


{{/*
Create the name of the service account to use
*/}}
{{- define "atlas.analytics.serviceAccountName" -}}
{{- if .Values.analytics.serviceAccount.create -}}
    {{ default (include "atlas.analytics.fullname" .) .Values.analytics.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.analytics.serviceAccount.name }}
{{- end -}}
{{- end -}}


{{/*
Create the name of the service account to use
*/}}
{{- define "atlas.client.serviceAccountName" -}}
{{- if .Values.client.serviceAccount.create -}}
    {{ default (include "atlas.client.fullname" .) .Values.client.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.client.serviceAccount.name }}
{{- end -}}
{{- end -}}


{{/*
Create the name of the service account to use
*/}}
{{- define "atlas.api.serviceAccountName" -}}
{{- if .Values.api.serviceAccount.create -}}
    {{ default (include "atlas.api.fullname" .) .Values.api.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.api.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "atlas.media.serviceAccountName" -}}
{{- if .Values.media.serviceAccount.create -}}
    {{ default (include "atlas.media.fullname" .) .Values.media.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.media.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "atlas.gameserver.serviceAccountName" -}}
{{- if .Values.gameserver.serviceAccount.create -}}
    {{ default (include "atlas.gameserver.fullname" .) .Values.gameserver.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.gameserver.serviceAccount.name }}
{{- end -}}
{{- end -}}


{{/*
Create the name of the service account to use
*/}}
{{- define "atlas.testbot.serviceAccountName" -}}
{{- if ((.Values.testbot).serviceAccount).create -}}
    {{ default (include "atlas.testbot.fullname" .) .Values.testbot.serviceAccount.name }}
{{- else -}}
    {{ default "default" ((.Values.testbot).serviceAccount).name }}
{{- end -}}
{{- end -}}


{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "atlas.mariadb.fullname" -}}
{{- if ((.Values.mariadb).fullnameOverride) -}}
{{- .Values.mariadb.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.mariadb.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}


{{/*
Set maria host
*/}}
{{- define "atlas.mariadb.host" -}}
{{- if ((.Values.mariadb).enabled) -}}
{{- template "atlas.mariadb.fullname" . -}}
{{- else if ((.Values.mariadb).externalHost) -}}
{{- .Values.mariadb.externalHost | quote -}}
{{- end -}}
{{- end -}}
