"use client"

import * as React from "react"

export type PropRow = {
  prop: string
  type: string
  defaultValue?: string
  description: string
}

export function PropsTable({ title, rows }: { title: string; rows: PropRow[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr className="[&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium">
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody className="[&_td]:px-4 [&_td]:py-3 [&_tr:not(:last-child)]:border-b">
            {rows.map((row) => (
              <tr key={row.prop}>
                <td className="font-mono text-foreground/90">{row.prop}</td>
                <td className="font-mono text-muted-foreground">{row.type}</td>
                <td className="font-mono text-muted-foreground">{row.defaultValue ?? "—"}</td>
                <td className="text-muted-foreground">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

