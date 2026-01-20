import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TalentSkill } from '@/types/talent';

interface SkillComparisonProps {
  requiredSkills: string[];
  niceToHaveSkills?: string[];
  talentSkills: TalentSkill[];
}

export function SkillComparison({
  requiredSkills,
  niceToHaveSkills = [],
  talentSkills,
}: SkillComparisonProps) {
  const talentSkillNames = talentSkills.map((s) => s.name.toLowerCase());
  const talentSkillMap = new Map(
    talentSkills.map((s) => [s.name.toLowerCase(), s])
  );

  const hasSkill = (skill: string) => {
    const lower = skill.toLowerCase();
    return talentSkillNames.some(
      (ts) => ts.includes(lower) || lower.includes(ts)
    );
  };

  const getSkillLevel = (skill: string): TalentSkill | undefined => {
    const lower = skill.toLowerCase();
    for (const [name, skillData] of talentSkillMap) {
      if (name.includes(lower) || lower.includes(name)) {
        return skillData;
      }
    }
    return undefined;
  };

  const matchedRequired = requiredSkills.filter(hasSkill);
  const missingRequired = requiredSkills.filter((s) => !hasSkill(s));
  const matchedNice = niceToHaveSkills.filter(hasSkill);

  const matchPercentage =
    requiredSkills.length > 0
      ? Math.round((matchedRequired.length / requiredSkills.length) * 100)
      : 100;

  return (
    <div className="space-y-6">
      {/* Match Summary */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
        <div>
          <p className="text-sm text-muted-foreground">Skills Match</p>
          <p className="text-2xl font-display font-semibold text-foreground">
            {matchedRequired.length}/{requiredSkills.length} required
          </p>
        </div>
        <div
          className={`text-3xl font-display font-bold ${
            matchPercentage >= 80
              ? 'text-verdict-interview'
              : matchPercentage >= 50
              ? 'text-accent'
              : 'text-verdict-caution'
          }`}
        >
          {matchPercentage}%
        </div>
      </div>

      {/* Required Skills */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">
          Required Skills ({matchedRequired.length}/{requiredSkills.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {requiredSkills.map((skill) => {
            const matched = hasSkill(skill);
            const skillData = getSkillLevel(skill);
            return (
              <Badge
                key={skill}
                variant="outline"
                className={`gap-1.5 ${
                  matched
                    ? 'border-verdict-interview/50 bg-verdict-interview/10 text-verdict-interview'
                    : 'border-verdict-pass/50 bg-verdict-pass/10 text-verdict-pass'
                }`}
              >
                {matched ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {skill}
                {matched && skillData && (
                  <span className="text-[10px] opacity-75 ml-1">
                    ({skillData.level})
                  </span>
                )}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Nice to Have Skills */}
      {niceToHaveSkills.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">
            Nice to Have ({matchedNice.length}/{niceToHaveSkills.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {niceToHaveSkills.map((skill) => {
              const matched = hasSkill(skill);
              return (
                <Badge
                  key={skill}
                  variant="outline"
                  className={`gap-1.5 ${
                    matched
                      ? 'border-accent/50 bg-accent/10 text-accent'
                      : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {matched ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <MinusCircle className="w-3 h-3" />
                  )}
                  {skill}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Missing Required Skills Warning */}
      {missingRequired.length > 0 && (
        <div className="p-3 rounded-lg bg-verdict-caution/10 border border-verdict-caution/30">
          <p className="text-sm text-verdict-caution font-medium mb-2">
            Skills to Develop
          </p>
          <p className="text-xs text-muted-foreground">
            Consider taking assessments or adding projects to demonstrate: {missingRequired.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
