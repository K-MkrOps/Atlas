import i18n from 'i18next'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { ThemeContext } from 'styled-components'

import { bytesToSize } from '../../functions/utils'
import Dialog from './Dialog'

/**
 * ColoredText used to provide color property Dynamically.
 *
 * @type {Styled component}
 */
const ColoredText = (styled as any).span`
  color: ${(props) => props.color};
`

/**
 * PerformanceItemContainer used as wrapper element for Performance score.
 *
 * @type {Styled component}
 */
const PerformanceItemContainer = (styled as any).li`
  display: flex;
  min-height: 100px;
  background-color: var(--toolbar);
  border: 1px solid var(--deepPurple);
  border-radius: 4px;
  margin: 4px;
  color: white;
  max-width: 560px;

  & > :first-child {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100px;
  }

  & > :last-child {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 12px;
    border-left: 1px solid var(--panelCardHoverOutline);
  }

  h5 {
    font-size: 20px;
  }

  h6 {
    font-size: 16px;
  }

  a {
    white-space: nowrap;
    color: var(--blue);
  }

  p {
    margin: 0;
  }
`

/**
 * PerformanceCheckItem used to render view for PerformanceCheckDialog.
 *
 * @param       {String} score
 * @param       {String} scoreColor
 * @param       {String} title
 * @param       {String} description
 * @param       {String} learnMoreUrl
 * @param       {node} children
 * @constructor
 */
function PerformanceCheckItem({ score, scoreColor, title, description, learnMoreUrl, children }) {
  const { t } = useTranslation()
  return (
    <PerformanceItemContainer>
      <div>
        <ColoredText as="h5" color={scoreColor}>
          {score}
        </ColoredText>
      </div>
      <div>
        <h6>
          {title}: {children}
        </h6>
        <p>
          {description}{' '}
          <a rel="noopener noreferrer" target="_blank" href={learnMoreUrl}>
            {t('editor:dialog.performance.learnMore')}
          </a>
        </p>
      </div>
    </PerformanceItemContainer>
  )
}

/**
 * initializing scoreToValue with object containing Low Medium High.
 *
 * @type {Object}
 */
const scoreToValue = {
  Low: 0,
  Medium: 1,
  High: 2
}

/**
 * PerformanceCheckDialog used render view containing Performance scores.
 *
 * @param       {String} scores
 * @param       {any} rest
 * @constructor
 */
export function PerformanceCheckDialog({ scores, ...rest }) {
  const theme: any = useContext(ThemeContext)
  const { t } = useTranslation()

  //initializing scoreToColor using theme
  const scoreToColor = {
    Low: theme.green,
    Medium: theme.yellow,
    High: theme.red
  }

  // initializing texturesScore using scores.textures.largeTexturesScore if scoreToValue contains scores.textures.largeTexturesScore
  // else setting scores.textures.score
  const texturesScore =
    scoreToValue[scores.textures.largeTexturesScore] > scoreToValue[scores.textures.score]
      ? scores.textures.largeTexturesScore
      : scores.textures.score
  // returing view containing Performance
  return (
    <Dialog {...rest}>
      <ul>
        <PerformanceCheckItem
          title={t('editor:dialog.performance.lbl-polycount')}
          description={t('editor:dialog.performance.info-polycount')}
          learnMoreUrl="htts://atlas.dev/docs/editor-optimization.html"
          score={scores.polygons.score}
          scoreColor={scoreToColor[scores.polygons.score]}
        >
          <ColoredText color={scoreToColor[scores.polygons.score]}>
            {t('editor:dialog.performance.txt-polycount', { count: scores.polygons.value.toLocaleString() })}
          </ColoredText>
        </PerformanceCheckItem>
        <PerformanceCheckItem
          title={t('editor:dialog.performance.lbl-material')}
          description={t('editor:dialog.performance.info-material')}
          learnMoreUrl="htts://atlas.dev/docs/editor-optimization.html"
          score={scores.materials.score}
          scoreColor={scoreToColor[scores.materials.score]}
        >
          <ColoredText color={scoreToColor[scores.materials.score]}>
            {t('editor:dialog.performance.txt-material', { count: scores.materials.value })}
          </ColoredText>
        </PerformanceCheckItem>
        <PerformanceCheckItem
          title={t('editor:dialog.performance.lbl-texture')}
          description={t('editor:dialog.performance.info-texture')}
          learnMoreUrl="htts://atlas.dev/docs/editor-optimization.html"
          score={texturesScore}
          scoreColor={scoreToColor[texturesScore]}
        >
          <ColoredText color={scoreToColor[scores.textures.score]}>
            {t('editor:dialog.performance.txt-ram', { count: bytesToSize(scores.textures.value) as any })}
          </ColoredText>
          ,{' '}
          <ColoredText color={scoreToColor[scores.textures.largeTexturesScore]}>
            {t('editor:dialog.performance.txt-texture', { count: scores.textures.largeTexturesValue })}
          </ColoredText>
        </PerformanceCheckItem>
        <PerformanceCheckItem
          title={t('editor:dialog.performance.lbl-lights')}
          description={t('editor:dialog.performance.info-lights')}
          learnMoreUrl="htts://atlas.dev/docs/editor-optimization.html"
          score={scores.lights.score}
          scoreColor={scoreToColor[scores.lights.score]}
        >
          <ColoredText color={scoreToColor[scores.lights.score]}>
            {t('editor:dialog.performance.txt-lights', { count: scores.lights.value })}
          </ColoredText>
        </PerformanceCheckItem>
        <PerformanceCheckItem
          title={t('editor:dialog.performance.lbl-fileSize')}
          description={t('editor:dialog.performance.info-fileSize')}
          learnMoreUrl="htts://atlas.dev/docs/editor-optimization.html"
          score={scores.fileSize.score}
          scoreColor={scoreToColor[scores.fileSize.score]}
        >
          <ColoredText color={scoreToColor[scores.fileSize.score]}>{bytesToSize(scores.fileSize.value)}</ColoredText>
        </PerformanceCheckItem>
      </ul>
    </Dialog>
  )
}

PerformanceCheckDialog.defaultProps = {
  tag: 'div',
  title: i18n.t('editor:dialog.performance.info-fileSize') || 'Performance Check',
  confirmLabel: i18n.t('editor:dialog.performance.info-fileSize') || 'Publish Scene'
}

export default PerformanceCheckDialog
