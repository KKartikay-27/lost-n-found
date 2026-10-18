{{- define "lostnfound.name" -}}{{ .Release.Name }}{{- end -}}

{{- define "lostnfound.labels" -}}
app.kubernetes.io/part-of: lostnfound
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end -}}

{{- define "lostnfound.apiSelector" -}}
app.kubernetes.io/name: lostnfound-api
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "lostnfound.mongoSelector" -}}
app.kubernetes.io/name: lostnfound-mongo
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "lostnfound.imageTag" -}}{{ .Values.image.tag | default .Chart.AppVersion }}{{- end -}}

{{- define "lostnfound.restrictedSecurityContext" -}}
allowPrivilegeEscalation: false
readOnlyRootFilesystem: true
capabilities:
  drop: ["ALL"]
{{- end -}}
