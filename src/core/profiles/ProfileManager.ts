import * as vscode from "vscode"
import * as path from "path"
import fs from "fs/promises"
import { ApiProvider } from "../../shared/api"

interface Profile {
    id: string
    name: string
    settings: {
        apiProvider?: ApiProvider
        apiModelId?: string
        awsRegion?: string
        awsUseCrossRegionInference?: boolean
        vertexProjectId?: string
        vertexRegion?: string
        customInstructions?: string
        alwaysAllowReadOnly?: boolean
        alwaysAllowWrite?: boolean
        alwaysAllowExecute?: boolean
        alwaysAllowBrowser?: boolean
        openAiBaseUrl?: string
        openAiModelId?: string
        ollamaModelId?: string
        ollamaBaseUrl?: string
        lmStudioModelId?: string
        lmStudioBaseUrl?: string
        anthropicBaseUrl?: string
        azureApiVersion?: string
        openRouterModelId?: string
        openRouterModelInfo?: any
        openRouterUseMiddleOutTransform?: boolean
        allowedCommands?: string[]
        soundEnabled?: boolean
        soundVolume?: number
        diffEnabled?: boolean
        alwaysAllowMcp?: boolean
        browserViewportSize?: string
        screenshotQuality?: number
        fuzzyMatchThreshold?: number
        preferredLanguage?: string
        writeDelayMs?: number
    }
    secrets: {
        apiKey?: string
        openRouterApiKey?: string
        awsAccessKey?: string
        awsSecretKey?: string
        awsSessionToken?: string
        openAiApiKey?: string
        geminiApiKey?: string
        openAiNativeApiKey?: string
        deepSeekApiKey?: string
    }
}

export class ProfileManager {
    private static readonly PROFILES_FILE = "profiles.json"
    private profiles: Map<string, Profile> = new Map()
    private activeProfileId?: string

    constructor(private context: vscode.ExtensionContext) {}

    private async getProfilesPath(): Promise<string> {
        const profilesPath = path.join(this.context.globalStorageUri.fsPath, ProfileManager.PROFILES_FILE)
        return profilesPath
    }

    async loadProfiles(): Promise<void> {
        try {
            const profilesPath = await this.getProfilesPath()
            const data = await fs.readFile(profilesPath, 'utf-8')
            const profilesData = JSON.parse(data)
            this.profiles = new Map(Object.entries(profilesData.profiles))
            this.activeProfileId = profilesData.activeProfileId
        } catch (error) {
            // If file doesn't exist, initialize with default profile
            await this.createProfile('default', 'Default Profile')
            await this.setActiveProfile('default')
        }
    }

    async saveProfiles(): Promise<void> {
        const profilesPath = await this.getProfilesPath()
        const data = {
            profiles: Object.fromEntries(this.profiles),
            activeProfileId: this.activeProfileId
        }
        await fs.writeFile(profilesPath, JSON.stringify(data, null, 2))
    }

    async createProfile(id: string, name: string): Promise<Profile> {
        if (this.profiles.has(id)) {
            throw new Error(`Profile with ID ${id} already exists`)
        }

        const profile: Profile = {
            id,
            name,
            settings: {},
            secrets: {}
        }

        this.profiles.set(id, profile)
        await this.saveProfiles()
        return profile
    }

    async setActiveProfile(id: string): Promise<void> {
        if (!this.profiles.has(id)) {
            throw new Error(`Profile with ID ${id} does not exist`)
        }
        this.activeProfileId = id
        await this.saveProfiles()
    }

    getActiveProfile(): Profile | undefined {
        return this.activeProfileId ? this.profiles.get(this.activeProfileId) : undefined
    }

    getAllProfiles(): Profile[] {
        return Array.from(this.profiles.values())
    }

    async updateProfile(id: string, updates: Partial<Profile>): Promise<void> {
        const profile = this.profiles.get(id)
        if (!profile) {
            throw new Error(`Profile with ID ${id} does not exist`)
        }

        this.profiles.set(id, {
            ...profile,
            ...updates,
            settings: { ...profile.settings, ...updates.settings },
            secrets: { ...profile.secrets, ...updates.secrets }
        })

        await this.saveProfiles()
    }

    async deleteProfile(id: string): Promise<void> {
        if (id === 'default') {
            throw new Error('Cannot delete default profile')
        }
        
        if (this.activeProfileId === id) {
            this.activeProfileId = 'default'
        }

        this.profiles.delete(id)
        await this.saveProfiles()
    }
}
