import { getSsmLMaxLength as func } from 'md-to-google-ssml'

export const ssmlMaxLength = (ssml: string) => {
    return func(ssml, { projectId: '', keyFileName: '' })
}