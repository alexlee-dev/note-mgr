import chalk from "chalk"
import { Command } from "commander"
import { formatDt, Notes, Frontmatter, FrontmatterKeys } from "./utils"

type Style = keyof Frontmatter
export function counters(args: Command) {
    const { category, date, publish, stage, tags } = args

    const styles: Style[] = []
    if (category) {
        styles.push("category")
    }
    if (tags) {
        styles.push("tags")
    }
    if (date) {
        styles.push("date")
    }
    if (stage) {
        styles.push("stage")
    }
    if (publish) {
        styles.push("publish")
    }
    new CountNotes(styles)
}

class CountNotes extends Notes {
    counted: Map<string, number> = new Map()
    styles: Style[] = []
    total = 0
    notes: Array<Frontmatter & { path: string }> = []
    constructor(styles: Style[]) {
        super()
        this.styles = styles
        this.fetchNotes().then(() => {
            this.total = this.notes.length
            styles.forEach((style) => this.byStyle(style))
        })
    }
    private async fetchNotes() {
        this.notes = await this.frontMatter()
        return this.notes
    }
    print(style: Style) {
        console.log(chalk.bold.blue(`The count of notes by ${style}:\n`))
        for (let [date, count] of this.counted) {
            console.log(`${date}: ${count}`)
        }
        console.log(chalk.bold.blue(`\nTotal note count: ${this.total}`))
        console.log(chalk.bold.blue(`^^^^^^^^^^^\n`))
    }

    async byStyle(style: Style) {
        this.counted = this.notes.reduce((acc, cur) => {
            const val = this.findVal(style, cur)
            if (Array.isArray(val)) {
                val.forEach((value) => {
                    if (acc.has(value)) {
                        acc.set(value, acc.get(value) + 1)
                    } else {
                        acc.set(value, 1)
                    }
                })
            } else {
                if (acc.has(val)) {
                    acc.set(val, acc.get(val) + 1)
                } else {
                    acc.set(val, 1)
                }
            }

            return acc
        }, new Map())
        this.print(style)
    }
    private findVal(
        targetFrontmatter: keyof Frontmatter,
        frontmatterObj: Frontmatter & { path: string }
    ) {
        if (
            targetFrontmatter === FrontmatterKeys.date ||
            targetFrontmatter === FrontmatterKeys.publish
        ) {
            return formatDt(frontmatterObj[targetFrontmatter])
        }
        return frontmatterObj[targetFrontmatter]
    }
}
