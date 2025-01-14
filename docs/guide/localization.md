# Localization

All the game resources (scripts, audio, voice, backgrounds, etc) can be localized to multiple languages/cultures.

Resources originally used to author the project are associated with *source locale* by default. For example, given the game is initially authored in English, all the original (source) naninovel scripts, UIs, signs on backgrounds, etc are in English; this means the *source locale* is `en` (or `en-GB` / `en-US` / etc in case you wish to use separate locales for specific regions).

The *source locale* can be changed via `Naninovel -> Configuration -> Localization` menu with `Source Locale` property. `Source Locale` property only determines the name (ID) of the locale associated with source project assets and is used in the "Language" drop-down settings menu and related engine APIs to distinguish the locale.

To add a locale create sub-folder inside `Resources/Naninovel/Localization` (the so-called *localization resources root*) with a name equal to one of the [RFC5646](https://gist.github.com/Elringus/db90d9c74f13c00fa35131e61d1b73cb) language tags you wish to add localization for. For example, to add German locale, create `Resources/Naninovel/Localization/de` folder. The "Language" drop-down list in the game settings built-in UI will automatically incorporate all the added locales.

Be aware, that you don't have to create a sub-folder in the *localization resources root* for the *source locale*. All the project resources stored outside the *localization resources root* belong to the *source locale* by default.

*Localization resources root* specific path can be changed in the localization configuration menu via `Loader > Path Prefix` property. Notice, that the configured path is relative to a "Resources" folder (not the "Assets"). The resources folders are [handled in a special way](https://docs.unity3d.com/Manual/LoadingResourcesatRuntime.html) by Unity; you can have multiple such folders stored anywhere inside the project assets for organization purposes.

::: info NOTE
Like with any other type of resources, instead of using `Resources` folder you can opt for a different resource provider; for example, with [addressables](/guide/resource-providers#addressable) provider you can bundle locale-specific resources independently of the main game package and download them on-demand.
:::

To specify which locale is selected by default when player first runs the game use `Default Locale` property in the localization configuration menu. When the property is not specified, the game will start in *source locale* by default.

![](https://i.gyazo.com/fb50a8c5f5fa6624105f8eeca6a7523e.png)

## Resources Localization

Inside the *localization resources root* store resources that will be used instead of the source ones when the corresponding localization is selected in the game settings.

For example, if you wish to replace a "City" appearance sprite of a main background (background actor with "MainBackground" ID) with another one when a `ja-JP` locale is selected, place the localized version at the following path: `Resources/Naninovel/Localization/ja-JP/Backgrounds/MainBackground/City`.

## Scripts Localization

The resources localization scheme described above works with all the resource types, except naninovel scripts and managed text documents. For these type of resources, use localization tool accessible via `Naninovel -> Tools -> Localization`:

![](https://i.gyazo.com/1b47d70dcbbb45a3ab955b44c9b50942.png)

First, pick `Scripts Folder (input)` — project directory where Naninovel scenario scripts (`.nani`) are stored (eg, `Assets/Scripts`). Optionally, to generate localization documents for [managed text](/guide/managed-text) as well, pick `Text Folder (input)` — directory where the managed text documents are stored (`Assets/Resources/Naninovel/Text` by default).

Alternatively, in case you wish to generate localization documents not on the source locale, but on a previously generated documents for another locale, instead of source scenario scripts folder pick text folder with existing localization documents for another locale, eg `Assets/Resources/Naninovel/Localization/ja-JP/Text`.

Then select path to the locale folder where to store the generated localization resources. Make sure you've selected an actual locale folder (eg, `Resources/Naninovel/Localization/ja-JP`). Label under the property field will indicate when a valid output locale folder is selected displaying name of the selected localization target.

::: tip
It's possible to generate resources for all the available locales in the project at once; select *localization resources root* directory instead of a specific locale folder and continue as usual. The tool will iterate the sub-folders of the selected directory and generate resources for each of them.

![](https://i.gyazo.com/4f0a6373755f0e122958f1f98de13013.png)
:::

Press "Generate" button to create (update) the localization resources. On consequent runs the tool will respect previously generated localization documents and preserve localized statements in case the source material has not changed.

Script localization documents are grouped under `Scripts` folder and consist of statements in the following format:

```nani
# ID
; Source text
Translation text
```

`# ID` line is the unique identifier of the localized content, you shouldn't modify those.

`; Source text` line is the original content which you're expected to translate. It's just a comment, so changing this line won't have any effect; it's provided for convenience.

You're expected to put the actual translation right after the comment line with the source text. You can use any number of lines for the translation for readability (they'll be joined), just make sure to place them before next `# ID` line:

```nani
# aj0e5dea
; Aliquam ut <b>ultricies</b> enim, id venenatis.<br>Nullam rhoncus eros tempus.
Оценивая блеск <b>металлического</b> шарика, пространство равноденственно.<br>
Противостояние есть метеорный дождь.
```

When **Include Annotations** option is enabled, generated localization documents will contain script comments placed before localized lines. For example, given following source script text:

```nani
; Player has to pick route.
@choice "Go left"
@choice "Go right"
```

— following localization document will be generated:

```nani
# id1
; Go left;; Player has to pick route.

# id2
; Go right
```

::: tip EXAMPLE
Find example localization setup in the [demo project](/guide/getting-started#demo-project). Consider using it as a reference in case having issues setting up localization in your own project.
:::

::: tip
In case looking for an option to compile all the project scenario script and managed text localizable data into a single spreadsheet (eg, to share the text with a translation agency or editors for proofreading), check out [spreadsheet extension](/guide/spreadsheet).

![](https://i.gyazo.com/50767f3193ae5b3ed423ea7c213c786b.png)
:::

## UI Localization

To localize both custom and built-in UIs, use [managed text provider](/guide/managed-text#managed-text-provider) component. It can also be used to localize any other custom game objects (prefabs). For more information on how to use managed text records and localize them, refer to the managed text guide.

## Fonts

To display text in some languages, you'll need a compatible font. [Google's Roboto](https://fonts.google.com/specimen/Roboto) is used by default, which supports all Latin, Cyrillic, and Greek characters in Unicode 7.0.

::: tip
In case you're aiming to support multiple languages with a single font, check out [Noto fonts](https://www.google.com/get/noto/).
:::

Right-to-left (RTL) languages (Arabic, Hebrew, Persian, etc) are supported by the TMPro text printers, but require additional setup; [see the guide](/guide/text-printers.html#right-to-left-arabic-text) for more info.

When publishing for CJK languages (Chinese, Japanese and Korean), consider using Character Extractor utility to optimize TMPro font atlases size. ([guide](/guide/text-printers.html#cjk-languages))

To associate a font with a specific locale, use `Apply On Locale` property of font options found in UI configuration. When a locale is selected, the font will be automatically applied when that locale is selected in the game settings.

![](https://i.gyazo.com/52e1a5eaaf99f5b4415083d1c86e9c10.png)

In order for the feature to work, make sure `Font Change Configuration` component is set up properly on the text printer. ([guide](/guide/user-interface#changing-font))

## Community Localization

When released title gains enough popularity, community (players) may look to contribute additional localizations; this often leads to users hacking build assets to replace the displayed text. Naninovel provides runtime localization option allowing to add community localizations without tampering with the build files.

### Ejecting Localization Resources

To generate localization resources (script and managed text docs), run the game executable with `-nani-eject` argument, eg:

```
./game.exe -nani-eject
```

— this will launch the game as usual, but after Naninovel is initialized, it will eject the localization resources to Unity's [persistent data folder](https://docs.unity3d.com/ScriptReference/Application-persistentDataPath.html) under `Localization` folder. For example, if the application's company is `Foo` and game title is `Bar` ejected path on Windows will be following: `C:/Users/User/AppData/LocalLow/Foo/Bar/Localization`.

If you'd like to generate localization resources based on a built-in localization, append the locale tag to the eject arg. Eg, given the game has `ja-JP` localization, use the following args to eject the Japanese localization documents: `-nani-eject-ja-JP`. When the locale tag is not specified, documents for the source locale are ejected.

Notice `Localization/Author.txt` file; you can specify author of the localization by replacing the default content of the file. The content is displayed in the language dropdown by default, but developer may customize this behaviour. Don't delete the file itself, as it's required to detect presence of the community localization.

### Translating

After the documents are ejected you can start the translation. The process is similar to the "Scripts Localization" and "UI Localization" explained above. Script localization documents are stored at `Localization/Text/Scripts` folder, while managed text docs are stored at `Localization/Text`.

Restart the game as usual (without the eject arg) and it will automatically use the localization resources at the persistent data folder. For changes in script localization to take effect, associated script have to be re-loaded (save-loading is usually enough), but it may be required to restart the game in some cases.

In case developer updates the game, you can eject again to update the existing localization; new lines and records will be inserted, while existing translation for the unchanged source material will not be lost.

After the localization is finished, share the `Localization` folder and instruct end-users to place it under the aforementioned persistent data directory to activate the localization. To disable the localization, delete the folder.
