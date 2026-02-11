import ContentEditable from "react-contenteditable"

export default function Editable({ disabled = false, tagName, html, onChange, ...props }) {
  if (disabled) {
    const Tag = tagName
    return <Tag {...props}>{html}</Tag>
  }

  return (
    <ContentEditable
      disabled={disabled}
      tagName={tagName}
      html={html}
      onChange={onChange}
      {...props}
    />
  )
}
