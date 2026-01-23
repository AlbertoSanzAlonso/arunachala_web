#!/bin/bash

# Setup AI Skills for Arunachala Web Development
# Optimized for Google Antigravity + multi-IDE support:
#   - Google Antigravity: .agent/skills/ (native)
#   - Claude Code: .claude/skills/ symlink
#   - Gemini CLI: .gemini/skills/ symlink
#   - Codex (OpenAI): .codex/skills/ symlink
#   - GitHub Copilot: .github/copilot-instructions.md copy
#
# Usage:
#   ./setup.sh              # Interactive mode (select AI assistants)
#   ./setup.sh --all        # Configure all AI assistants
#   ./setup.sh --claude     # Configure only Claude
#   ./setup.sh --antigravity # Setup Antigravity (native)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
# Google Antigravity skills directory (your primary setup)
SKILLS_SOURCE="$REPO_ROOT/.agent/skills"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Selection flags
SETUP_CLAUDE=false
SETUP_GEMINI=false
SETUP_CODEX=false
SETUP_COPILOT=false
SETUP_ANTIGRAVITY=false

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Configure AI coding assistants for Arunachala Web development."
    echo ""
    echo "Options:"
    echo "  --all           Configure all AI assistants"
    echo "  --claude        Configure Claude Code"
    echo "  --gemini        Configure Gemini CLI"
    echo "  --codex         Configure Codex (OpenAI)"
    echo "  --copilot       Configure GitHub Copilot"
    echo "  --antigravity  Setup Google Antigravity (native)"
    echo "  --help          Show this help message"
    echo ""
    echo "If no options provided, runs in interactive mode."
    echo ""
    echo "Examples:"
    echo "  $0                        # Interactive selection"
    echo "  $0 --all                  # All AI assistants"
    echo "  $0 --antigravity          # Google Antigravity (already set up)"
    echo "  $0 --claude --antigravity # Claude + Antigravity"
}

show_menu() {
    echo -e "${BOLD}Which AI assistants do you use?${NC}"
    echo -e "${CYAN}(Google Antigravity is your primary setup)${NC}"
    echo ""

    local options=("Google Antigravity (Native)" "Claude Code" "Gemini CLI" "Codex (OpenAI)" "GitHub Copilot")
    local selected=(true false false false false)  # Antigravity selected by default

    while true; do
        for i in "${!options[@]}"; do
            if [ "${selected[$i]}" = true ]; then
                echo -e "  ${GREEN}[x]${NC} $((i+1)). ${options[$i]}"
            else
                echo -e "  [ ] $((i+1)). ${options[$i]}"
            fi
        done
        echo ""
        echo -e "  ${YELLOW}a${NC}. Select all except Antigravity (already set up)"
        echo -e "  ${YELLOW}n${NC}. Select none"
        echo ""
        echo -n "Toggle (1-5, a, n) or Enter to confirm: "

        read -r choice

        case $choice in
            1) selected[0]=$([ "${selected[0]}" = true ] && echo false || echo true) ;;
            2) selected[1]=$([ "${selected[1]}" = true ] && echo false || echo true) ;;
            3) selected[2]=$([ "${selected[2]}" = true ] && echo false || echo true) ;;
            4) selected[3]=$([ "${selected[3]}" = true ] && echo false || echo true) ;;
            5) selected[4]=$([ "${selected[4]}" = true ] && echo false || echo true) ;;
            a|A) selected=(true true true true true) && selected[0]=false ;; # All except Antigravity
            n|N) selected=(false false false false false) ;;
            "") break ;;
            *) echo -e "${RED}Invalid option${NC}" ;;
        esac

        # Move cursor up to redraw menu
        echo -en "\033[12A\033[J"
    done

    SETUP_ANTIGRAVITY=${selected[0]}
    SETUP_CLAUDE=${selected[1]}
    SETUP_GEMINI=${selected[2]}
    SETUP_CODEX=${selected[3]}
    SETUP_COPILOT=${selected[4]}
}

setup_antigravity() {
    # Google Antigravity uses .agent/skills/ natively
    if [ -d "$SKILLS_SOURCE" ]; then
        echo -e "${GREEN}  ✓ Google Antigravity: .agent/skills/ (native)${NC}"
        echo -e "${GREEN}  ✓ AGENTS.md is already configured for Antigravity${NC}"
    else
        echo -e "${RED}  ✗ .agent/skills/ not found${NC}"
        echo -e "${YELLOW}  Please create skills in .agent/skills/ first${NC}"
    fi
}

setup_claude() {
    local target="$REPO_ROOT/.claude/skills"

    if [ ! -d "$REPO_ROOT/.claude" ]; then
        mkdir -p "$REPO_ROOT/.claude"
    fi

    if [ -L "$target" ]; then
        rm "$target"
    elif [ -d "$target" ]; then
        mv "$target" "$REPO_ROOT/.claude/skills.backup.$(date +%s)"
    fi

    # Create symlink from .agent/skills to .claude/skills
    ln -s "$SKILLS_SOURCE" "$target"
    echo -e "${GREEN}  ✓ .claude/skills -> .agent/skills/${NC}"

    # Copy AGENTS.md to CLAUDE.md
    copy_agents_md "CLAUDE.md"
}

setup_gemini() {
    local target="$REPO_ROOT/.gemini/skills"

    if [ ! -d "$REPO_ROOT/.gemini" ]; then
        mkdir -p "$REPO_ROOT/.gemini"
    fi

    if [ -L "$target" ]; then
        rm "$target"
    elif [ -d "$target" ]; then
        mv "$target" "$REPO_ROOT/.gemini/skills.backup.$(date +%s)"
    fi

    # Create symlink from .agent/skills to .gemini/skills
    ln -s "$SKILLS_SOURCE" "$target"
    echo -e "${GREEN}  ✓ .gemini/skills -> .agent/skills/${NC}"

    # Copy AGENTS.md to GEMINI.md
    copy_agents_md "GEMINI.md"
}

setup_codex() {
    local target="$REPO_ROOT/.codex/skills"

    if [ ! -d "$REPO_ROOT/.codex" ]; then
        mkdir -p "$REPO_ROOT/.codex"
    fi

    if [ -L "$target" ]; then
        rm "$target"
    elif [ -d "$target" ]; then
        mv "$target" "$REPO_ROOT/.codex/skills.backup.$(date +%s)"
    fi

    # Create symlink from .agent/skills to .codex/skills
    ln -s "$SKILLS_SOURCE" "$target"
    echo -e "${GREEN}  ✓ .codex/skills -> .agent/skills/${NC}"
    echo -e "${GREEN}  ✓ Codex uses AGENTS.md natively${NC}"
}

setup_copilot() {
    if [ -f "$REPO_ROOT/AGENTS.md" ]; then
        mkdir -p "$REPO_ROOT/.github"
        cp "$REPO_ROOT/AGENTS.md" "$REPO_ROOT/.github/copilot-instructions.md"
        echo -e "${GREEN}  ✓ AGENTS.md -> .github/copilot-instructions.md${NC}"
    fi
}

copy_agents_md() {
    local target_name="$1"
    local agents_files
    local count=0

    agents_files=$(find "$REPO_ROOT" -name "AGENTS.md" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null)

    for agents_file in $agents_files; do
        local agents_dir
        agents_dir=$(dirname "$agents_file")
        cp "$agents_file" "$agents_dir/$target_name"
        count=$((count + 1))
    done

    echo -e "${GREEN}  ✓ Copied $count AGENTS.md -> $target_name${NC}"
}

# =============================================================================
# PARSE ARGUMENTS
# =============================================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            SETUP_CLAUDE=true
            SETUP_GEMINI=true
            SETUP_CODEX=true
            SETUP_COPILOT=true
            # Note: Don't set SETUP_ANTIGRAVITY=true (already native)
            shift
            ;;
        --claude)
            SETUP_CLAUDE=true
            shift
            ;;
        --gemini)
            SETUP_GEMINI=true
            shift
            ;;
        --codex)
            SETUP_CODEX=true
            shift
            ;;
        --copilot)
            SETUP_COPILOT=true
            shift
            ;;
        --antigravity)
            SETUP_ANTIGRAVITY=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# =============================================================================
# MAIN
# =============================================================================

echo "🚀 Arunachala Web - AI Skills Setup"
echo "==================================="
echo ""

# Count skills in .agent/skills/
SKILL_COUNT=$(find "$SKILLS_SOURCE" -maxdepth 2 -name "SKILL.md" | wc -l | tr -d ' ')

if [ "$SKILL_COUNT" -eq 0 ]; then
    echo -e "${RED}No skills found in .agent/skills/${NC}"
    echo -e "${YELLOW}Please run opencode or create skills first${NC}"
    exit 1
fi

echo -e "${BLUE}Found $SKILL_COUNT skills in .agent/skills/${NC}"
echo ""

# Interactive mode if no flags provided
if [ "$SETUP_ANTIGRAVITY" = false ] && [ "$SETUP_CLAUDE" = false ] && [ "$SETUP_GEMINI" = false ] && [ "$SETUP_CODEX" = false ] && [ "$SETUP_COPILOT" = false ]; then
    show_menu
    echo ""
fi

# Check if at least one selected
if [ "$SETUP_ANTIGRAVITY" = false ] && [ "$SETUP_CLAUDE" = false ] && [ "$SETUP_GEMINI" = false ] && [ "$SETUP_CODEX" = false ] && [ "$SETUP_COPILOT" = false ]; then
    echo -e "${YELLOW}No AI assistants selected. Nothing to do.${NC}"
    exit 0
fi

# Run selected setups
STEP=1
TOTAL=0
[ "$SETUP_ANTIGRAVITY" = true ] && TOTAL=$((TOTAL + 1))
[ "$SETUP_CLAUDE" = true ] && TOTAL=$((TOTAL + 1))
[ "$SETUP_GEMINI" = true ] && TOTAL=$((TOTAL + 1))
[ "$SETUP_CODEX" = true ] && TOTAL=$((TOTAL + 1))
[ "$SETUP_COPILOT" = true ] && TOTAL=$((TOTAL + 1))

if [ "$SETUP_ANTIGRAVITY" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Verifying Google Antigravity setup...${NC}"
    setup_antigravity
    STEP=$((STEP + 1))
fi

if [ "$SETUP_CLAUDE" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up Claude Code...${NC}"
    setup_claude
    STEP=$((STEP + 1))
fi

if [ "$SETUP_GEMINI" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up Gemini CLI...${NC}"
    setup_gemini
    STEP=$((STEP + 1))
fi

if [ "$SETUP_CODEX" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up Codex (OpenAI)...${NC}"
    setup_codex
    STEP=$((STEP + 1))
fi

if [ "$SETUP_COPILOT" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up GitHub Copilot...${NC}"
    setup_copilot
    STEP=$((STEP + 1))
fi

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo -e "${GREEN}✅ Successfully configured $SKILL_COUNT AI skills!${NC}"
echo ""
echo "Configured assistants:"
[ "$SETUP_ANTIGRAVITY" = true ] && echo "  • Google Antigravity: .agent/skills/ (native) ✓"
[ "$SETUP_CLAUDE" = true ] && echo "  • Claude Code:       .claude/skills/ + CLAUDE.md"
[ "$SETUP_CODEX" = true ] && echo "  • Codex (OpenAI):   .codex/skills/ + AGENTS.md (native)"
[ "$SETUP_GEMINI" = true ] && echo "  • Gemini CLI:        .gemini/skills/ + GEMINI.md"
[ "$SETUP_COPILOT" = true ] && echo "  • GitHub Copilot:     .github/copilot-instructions.md"
echo ""
echo -e "${BLUE}Primary Setup:${NC}"
echo "  • Google Antigravity is your native configuration"
echo "  • AGENTS.md is optimized for auto-invocation"
echo ""
echo -e "${BLUE}Usage:${NC}"
echo "  • Restart your AI assistant(s) to load skills"
echo "  • Edit .agent/skills/ or AGENTS.md → Run this script again"
echo -e "${BLUE}Note:${NC} Skills are synchronized across all configured assistants"